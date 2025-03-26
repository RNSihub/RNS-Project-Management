from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
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
from google.oauth2 import id_token
from google.auth.transport import requests
import os



# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
meetings_collection = db[os.getenv("MONGO_MEETINGS_COLLECTION")]
Tasks_collection = db[os.getenv("MONGO_JOBS_COLLECTION")]

# In-memory storage for OTPs
otp_storage = {}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

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
            user_identifier = data.get("email")  # or username depending on the login field
            password = data.get("password")

            if not user_identifier or not password:
                return JsonResponse({"error": "Both fields are required"}, status=400)

            user = meetings_collection.find_one({
                "$or": [{"username": user_identifier}, {"email": user_identifier}]
            })

            if not user:
                return JsonResponse({"error": "Invalid username or password"}, status=401)

            stored_password = user.get("password")
            if not stored_password:
                return JsonResponse({"error": "Invalid username or password"}, status=401)

            if bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
                user.pop("password", None)
                user["_id"] = str(user["_id"])

                user_id = user.get("_id")
                username = user.get("username")
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



def verify_google_token(token):
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), os.getenv("GOOGLE_OAUTH2_CLIENT_ID"))
        if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")
        return id_info
    except ValueError as e:
        return None

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
def google_signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            token = data.get("token", "").strip()

            if not token:
                return JsonResponse({"error": "Token is required."}, status=400)

            id_info = verify_google_token(token)
            if not id_info:
                return JsonResponse({"error": "Invalid Google token."}, status=400)

            username = id_info.get("name", "").strip()
            email = id_info.get("email", "").strip()
            google_id = id_info.get("sub", "").strip()

            if not all([username, email, google_id]):
                return JsonResponse({"error": "All fields are required."}, status=400)

            existing_user = meetings_collection.find_one(
                {"$or": [{"email": email}, {"googleId": google_id}]}
            )
            if existing_user:
                return JsonResponse({"error": "User already exists."}, status=400)

            user_data = {
                "username": username,
                "email": email,
                "googleId": google_id,
            }
            result = meetings_collection.insert_one(user_data)
            user_id = str(result.inserted_id)
            tokens = generate_tokens(user_id, username)

            return JsonResponse({"message": "Account created successfully!", "token": tokens}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": "Internal server error"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)