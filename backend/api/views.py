from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from playwright.sync_api import sync_playwright
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
import json
import os
from pymongo import MongoClient
from bson import ObjectId
from django.core.mail import send_mail
from django.conf import settings
import bcrypt
import random
import string
from datetime import datetime, timedelta, timezone
import time
import jwt


# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
meetings_collection = db[os.getenv("MONGO_MEETINGS_COLLECTION")]
jobs_collection = db[os.getenv("MONGO_JOBS_COLLECTION")]

# In-memory storage for OTPs
otp_storage = {}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def extract_tech_stack(description):
    """
    Extract tech keywords from the job description.
    """
    tech_keywords = [
        'python', 'javascript', 'java', 'react', 'node', 'aws', 'docker',
        'kubernetes', 'sql', 'nosql', 'mongodb', 'angular', 'vue', 'django',
        'flask', 'express', 'git', 'github', 'html', 'css', 'php', 'c++',
        'swift', 'kotlin', 'flutter', 'fastapi', 'airflow'
    ]
    found_tech = [word for word in tech_keywords if word.lower() in description.lower()]
    return ", ".join(found_tech)  # Return as string

@api_view(["GET"])
def home(request):
    data = {"status": "working"}
    return Response(data, status=status.HTTP_200_OK)

def setup_browser():
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=True)  # Launch headless browser
    context = browser.new_context()
    page = context.new_page()
    return playwright, browser, page

def freelancer_scrapper(search_query):
    """
    Scrape job listings from Freelancer.com based on a search query.

    Args:
        search_query (str): The keyword to search for jobs

    Returns:
        list: List of job dictionaries containing title, link, description, and tech stack
    """
    playwright, browser, page = setup_browser()
    jobs = []

    try:
        page.goto("https://www.freelancer.com/jobs", timeout=60000)
        if "freelancer.com" not in page.url:
            raise Exception("Failed to load Freelancer.com jobs page")

        page.wait_for_selector("#keyword-input", timeout=20000)
        search_box = page.locator("#keyword-input")

        if not search_box.is_visible() or not search_box.is_enabled():
            raise Exception("Search input field not interactable")

        search_box.fill(search_query)
        search_box.press("Enter")
        page.wait_for_timeout(5000)  # Wait for results to load

        job_elements = page.locator('//*[@class="JobSearchCard-primary-heading"]/a').all()
        desc_elements = page.locator('//*[@class="JobSearchCard-primary-description"]').all()

        if not job_elements:
            print("No job listings found on the page")

        for job, desc in zip(job_elements, desc_elements):
            try:
                full_description = desc.inner_text().strip()
                if not full_description:  # Skip if description is empty
                    continue

                truncated_description = "\n".join(full_description.splitlines()[:3])
                tech_stack = extract_tech_stack(full_description)

                job_data = {
                    'title': job.inner_text().strip(),
                    'link': job.get_attribute('href'),
                    'description': truncated_description,
                    'full_description': full_description,
                    'tech_stack': tech_stack
                }

                if job_data['link'] and not job_data['link'].startswith('http'):
                    job_data['link'] = f"https://www.freelancer.com{job_data['link']}"

                jobs.append(job_data)

            except Exception as e:
                print(f"Error processing individual job: {e}")
                continue

        print(f"Successfully scraped {len(jobs)} jobs for query: '{search_query}'")

    except Exception as e:
        print(f"Scraping error: {e}")
        if 'page' in locals():
            print(f"Current URL: {page.url}")
            print(f"Page title: {page.title()}")

    finally:
        try:
            browser.close()
            playwright.stop()
        except Exception as e:
            print(f"Error during cleanup: {e}")

    return jobs

def upwork_scrapper(search_query):
    playwright, browser, page = setup_browser()
    jobs = []

    try:
        page.goto("https://www.upwork.com/", timeout=60000)
        page.wait_for_selector("//input[@type='search']", timeout=20000)

        search_box = page.locator("//input[@type='search']")
        search_box.fill(search_query)
        search_box.press("Enter")
        page.wait_for_timeout(3000)

        job_elements = page.locator('//*[@class="job-title-link break visited"]').all()
        desc_elements = page.locator('//*[@class="job-description"]').all()

        for job, desc in zip(job_elements, desc_elements):
            description = desc.inner_text()
            tech_stack = extract_tech_stack(description)

            jobs.append({
                'title': job.inner_text(),
                'link': job.get_attribute('href'),
                'full_description': description,
                'tech_stack': tech_stack
            })

    except Exception as e:
        print(f"An error occurred in Upwork scraping: {e}")
    finally:
        browser.close()
        playwright.stop()

    return jobs

def remove_duplicates(jobs):
    seen = set()
    unique_jobs = []

    for job in jobs:
        job_id = (job["title"], job["link"])  # Use title and link as unique identifier
        if job_id not in seen:
            seen.add(job_id)
            unique_jobs.append(job)

    return unique_jobs

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

@api_view(["GET"])
def scrape_jobs(request):
    search_query = request.GET.get("search_query", "").strip()
    platform = request.GET.get("platform", "").strip()
    username = request.GET.get("username", "").strip()

    print(f"Searching for: '{search_query}' on '{platform}' for user: '{username}'")

    if not search_query or not platform:
        return Response(
            {"error": "Search query and platform are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if platform == "freelancer.com":
            jobs = freelancer_scrapper(search_query)
        elif platform == "upwork.com":
            jobs = upwork_scrapper(search_query)
        else:
            return Response(
                {"error": f"Invalid platform specified: {platform}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(jobs, list):
            print(f"Scraper returned invalid data: {jobs}")
            raise ValueError(f"Scraper for {platform} did not return a list")

        if not jobs:
            print("No jobs found.")
            return Response(
                {"jobs": [], "new_job_found": False, "new_jobs": []},
                status=status.HTTP_200_OK
            )

        print(f"Total jobs scraped: {len(jobs)}")
        jobs = remove_duplicates(jobs)

        new_jobs_found = False
        new_jobs_list = []
        all_jobs_list = jobs  # Default to all scraped jobs

        for job in jobs:
            existing_job = jobs_collection.find_one({
                "platform": platform,
                "keyword": search_query,
                "title": job["title"],
                "link": job["link"]
            })

            if not existing_job:
                job["platform"] = platform
                job["keyword"] = search_query
                jobs_collection.insert_one(job.copy())
                new_jobs_found = True
                new_jobs_list.append(job)

        if new_jobs_found and username:
            try:
                email_user = meetings_collection.find_one({"username": username})
                if not email_user:
                    print(f"User not found: {username}")
                else:
                    user_email = email_user.get("email")
                    if not user_email:
                        print(f"No email found for user: {username}")
                    else:
                        subject = "New Job Opportunities Found!"
                        message = f"Hi {username},\n\nNew job opportunities have been found:\n\n"
                        for job in new_jobs_list:
                            message += f"- {job['title']}: {job['link']}\n"
                        message += "\nVisit our site to view the jobs!"

                        send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.EMAIL_HOST_USER,
                            recipient_list=[user_email],
                            fail_silently=False,
                        )
                        print(f"Email sent to {user_email}")
            except Exception as email_error:
                print(f"Email sending error: {email_error}")

        response_data = {
            "jobs": all_jobs_list,
            "new_job_found": new_jobs_found,
            "new_jobs": new_jobs_list
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Scraping error: {e}")
        return Response(
            {"error": f"Job scraping failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
JWT_SECRET = "secret"
JWT_ALGORITHM = "HS256"
def generate_tokens(id, username):
    access_payload = {
        "id": str(id),
        "username": str(username),
        "exp": (datetime.utcnow() + timedelta(minutes=600)).timestamp(),  # Expiration in 600 minutes
        "iat": datetime.utcnow().timestamp(),  # Issued at current time
    }
    token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"jwt": token}

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_identifier = data.get("email")  # Accept username or email
            password = data.get("password")

            if not user_identifier or not password:
                return JsonResponse({"error": "Both fields are required"}, status=400)

            user = meetings_collection.find_one({
                "$or": [{"username": user_identifier}, {"email": user_identifier}]
            })
            
            if not user:
                return JsonResponse({"error": "Invalid username or password"}, status=401)

            stored_password = user.get("password")
            if check_password(password, stored_password):  # Use Django's check_password
                user.pop("password", None)
                user["_id"] = str(user["_id"])
                # Generate JWT token
                user_id = user.get("_id")  # Corrected line
                print(f"User ID: {user_id}")
                username = user.get("username")  # Corrected line
                tokens = generate_tokens(user_id, username)
                return JsonResponse({"message": "Login successful", "user": user, "token": tokens}, status=200)
            else:
                return JsonResponse({"error": "Invalid username or password"}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def send_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            email = data.get("email", "").strip()

            if not email:
                return JsonResponse({"error": "Email is required."}, status=400)

            otp = generate_otp()
            otp_storage[email] = {"otp": otp, "timestamp": time.time()}

            subject = "Your OTP for Password Reset"
            message = f"Your OTP is {otp}. It is valid for 10 minutes."
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP sent successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            email = data.get("email", "").strip()
            otp = data.get("otp", "").strip()

            if not email or not otp:
                return JsonResponse({"error": "Email and OTP are required."}, status=400)

            stored_otp_data = otp_storage.get(email)
            if not stored_otp_data:
                return JsonResponse({"error": "OTP not found."}, status=400)

            if time.time() - stored_otp_data["timestamp"] > 600:  # OTP valid for 10 minutes
                del otp_storage[email]
                return JsonResponse({"error": "OTP has expired."}, status=400)

            if stored_otp_data["otp"] == otp:
                del otp_storage[email]
                return JsonResponse({"message": "OTP verified successfully!"}, status=200)
            else:
                return JsonResponse({"error": "Invalid OTP."}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            email = data.get("email", "").strip()
            new_password = data.get("newPassword", "").strip()

            if not email or not new_password:
                return JsonResponse({"error": "Email and new password are required."}, status=400)

            user = meetings_collection.find_one({"email": email})
            if not user:
                return JsonResponse({"error": "User not found."}, status=404)

            hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
            meetings_collection.update_one({"email": email}, {"$set": {"password": hashed_password.decode("utf-8")}})

            return JsonResponse({"message": "Password reset successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def createaccount(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            username = data.get("username", "").strip()
            email = data.get("email", "").strip()
            phone = data.get("phone", "").strip()
            password = data.get("password", "").strip()

            if not all([username, email, phone, password]):
                return JsonResponse({"error": "All fields are required."}, status=400)

            existing_user = meetings_collection.find_one(
                {"$or": [{"email": email}, {"username": username}]}
            )
            if existing_user:
                return JsonResponse({"error": "Username or Email already exists."}, status=400)

            hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
            user_data = {
                "username": username,
                "email": email,
                "phone": phone,
                "password": hashed_password.decode("utf-8"),
            }
            meetings_collection.insert_one(user_data)

            return JsonResponse({"message": "Account created successfully!"}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"error": "Internal server error"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def forgot_send_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            email = data.get("email", "").strip()

            if not email:
                return JsonResponse({"error": "Email is required."}, status=400)

            # Check if the email exists in the database
            user = meetings_collection.find_one({"email": email})
            if not user:
                return JsonResponse({"error": "Invalid email."}, status=400)

            otp = generate_otp()
            otp_storage[email] = {"otp": otp, "timestamp": time.time()}

            subject = "Your OTP for Password Reset"
            message = f"Your OTP is {otp}. It is valid for 10 minutes."
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP sent successfully!"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)