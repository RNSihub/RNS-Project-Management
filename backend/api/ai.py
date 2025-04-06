import json
import os
import logging
from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from pymongo import MongoClient

import google.generativeai as genai

# Set up logging
logger = logging.getLogger(__name__)

# Configure the Gemini API
GEMINI_API_KEY = "AIzaSyBSQuSk_e9UHjWba-Kw89Xd-KjU8o2keBo"
genai.configure(api_key=GEMINI_API_KEY)

# Set up the model
model = genai.GenerativeModel('gemini-1.5-pro')

# MongoDB Connection
try:
    mongo_uri = os.environ.get('MONGO_URI', 'mongodb+srv://1QoSRtE75wSEibZJ:1QoSRtE75wSEibZJ@cluster0.mregq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client.get_database(os.environ.get('MONGO_DB', 'Todo_Lister'))
    user_story_collection = db['UserStory']
    user_mail = db['UserMail']
    saved_mail = db['SavedMail']
    logger.info("MongoDB connection established successfully")
except Exception as e:
    logger.error(f"MongoDB connection error: {str(e)}")

@csrf_exempt
@require_POST
def chatbot_view(request):
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')
        message_history = data.get('history', [])

        chat_history = message_history if message_history else []

        chat = model.start_chat(history=chat_history)
        response = chat.send_message(user_message)

        return JsonResponse({
            'response': response.text,
            'success': True
        })

    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'response': "I'm sorry, I encountered an error. Please try again later."
        }, status=500)

@csrf_exempt
@require_POST
def generate_content(request):
    try:
        data = json.loads(request.body)
        requirement_text = data.get('requirement')
        theme = data.get('theme', 'light')

        if not requirement_text:
            return JsonResponse({'error': 'Requirement text is required'}, status=400)

        result = generate_user_story_and_acceptance_criteria(requirement_text)
        return JsonResponse(result)

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        return JsonResponse({'error': 'Failed to generate content'}, status=500)

@csrf_exempt
@require_POST
def save_content(request):
    try:
        data = json.loads(request.body)
        requirement = data.get('requirement')
        content = data.get('content')
        user_id = data.get('user_id', 'anonymous')
        theme = data.get('theme', 'light')

        if not requirement or not content:
            return JsonResponse({'error': 'Requirement and content are required', 'success': False}, status=400)

        document = {
            'user_id': user_id,
            'requirement': requirement,
            'user_story': content.get('user_story', ''),
            'acceptance_criteria': content.get('acceptance_criteria', []),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }

        result = user_story_collection.insert_one(document)
        return JsonResponse({
            'success': True,
            'message': 'Content saved successfully',
            'id': str(result.inserted_id)
        })

    except Exception as e:
        logger.error(f"Error saving content: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to save content',
            'details': str(e)
        }, status=500)

@csrf_exempt
@require_POST
def get_saved_contents(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id', 'anonymous')
        limit = data.get('limit', 10)

        contents = list(user_story_collection.find(
            {'user_id': user_id},
            {'_id': 1, 'requirement': 1, 'user_story': 1, 'acceptance_criteria': 1, 'created_at': 1}
        ).sort('created_at', -1).limit(limit))

        for content in contents:
            content['_id'] = str(content['_id'])

        return JsonResponse({
            'success': True,
            'contents': contents
        })

    except Exception as e:
        logger.error(f"Error retrieving saved contents: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to retrieve saved contents',
            'details': str(e)
        }, status=500)

@csrf_exempt
@require_POST
def generate_mail(request):
    try:
        data = json.loads(request.body)
        user_details = data.get('userDetails')
        mail_config = data.get('mailConfig')

        if not user_details or not mail_config:
            return JsonResponse({'error': 'User details and mail configuration are required'}, status=400)

        prompt = f"""
        Generate a professional email based on the following details:

        User Details:
        - Name: {user_details.get('name')}
        - Role: {user_details.get('role')}
        - Department: {user_details.get('department')}
        - Employee ID: {user_details.get('employeeId', '')}
        - Class/Section: {user_details.get('class', '')}
        - Product/Factory Number: {user_details.get('productFactoryNumber', '')}

        Mail Configuration:
        - Mail Type: {mail_config.get('mailType')}
        - Recipient: {mail_config.get('recipient')}
        - Recipient Role: {mail_config.get('recipientRole')}
        - Start Date: {mail_config.get('startDate', '')}
        - End Date: {mail_config.get('endDate', '')}
        - Reason: {mail_config.get('reason')}
        - Subject: {mail_config.get('subject', '')}

        Ensure the email is polite, professional, and includes all necessary details.
        """

        response = model.generate_content(prompt)
        mail_content = response.text

        return JsonResponse({
            'mail_content': mail_content,
            'success': True
        })

    except Exception as e:
        logger.error(f"Error generating mail: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to generate mail',
            'details': str(e)
        }, status=500)

def generate_user_story_and_acceptance_criteria(requirement_text):
    try:
        prompt = f"""
        Based on the following requirement, generate a well-structured user story and detailed acceptance criteria.

        Requirement: {requirement_text}

        Please format your response as follows:
        1. User Story: Follow the format "As a [type of user], I want [an action] so that [benefit/value]"
         Acceptance Criteria: Provide a numbered list of specific, testable criteria that must be met for the story to be considered complete.

        Make sure the acceptance criteria are:
        - Clear and unambiguous
        - Testable/verifiable
        - Cover both happy path and edge cases
        - Include any specific business rules or constraints
        """

        response = model.generate_content(prompt)
        response_text = response.text

        user_story = ""
        acceptance_criteria = []

        sections = response_text.split("Acceptance Criteria:")

        if len(sections) > 0 and "User Story:" in sections[0]:
            user_story = sections[0].split("User Story:")[1].strip()

        if len(sections) > 1:
            criteria_text = sections[1].strip()
            for line in criteria_text.split('\n'):
                if (line.strip() and (line.strip()[0].isdigit() or line.strip()[0] == '-')):
                    clean_line = line.strip()
                    if clean_line[0].isdigit():
                        pos = 0
                        while pos < len(clean_line) and (clean_line[pos].isdigit() or clean_line[pos] in '.)'):
                            pos += 1
                        clean_line = clean_line[pos:].strip()
                    else:
                        clean_line = clean_line[1:].strip()
                    acceptance_criteria.append(clean_line)

        if not user_story:
            user_story = "Could not parse user story from the response."

        if not acceptance_criteria:
            acceptance_criteria = ["Could not parse acceptance criteria from the response."]

        return {
            'user_story': user_story,
            'acceptance_criteria': acceptance_criteria
        }

    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return {
            'user_story': "Error generating user story.",
            'acceptance_criteria': ["Error generating acceptance criteria."]
        }
