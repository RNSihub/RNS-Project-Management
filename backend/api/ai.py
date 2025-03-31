import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import google.generativeai as genai
import logging

# Set up logging
logger = logging.getLogger(__name__)
# Configure the Gemini API
GEMINI_API_KEY = "AIzaSyBSQuSk_e9UHjWba-Kw89Xd-KjU8o2keBo"
genai.configure(api_key=GEMINI_API_KEY)

# Set up the model
model = genai.GenerativeModel('gemini-1.5-pro')

@csrf_exempt
@require_POST
def chatbot_view(request):
    try:
        # Parse the request data
        data = json.loads(request.body)
        user_message = data.get('message', '')
        message_history = data.get('history', [])

        # If there's history, convert it to the format expected by the Gemini API
        chat_history = []
        if message_history:
            chat_history = message_history

        # Create a chat session
        chat = model.start_chat(history=chat_history)

        # Generate a response
        response = chat.send_message(user_message)

        # Return the response
        return JsonResponse({
            'response': response.text,
            'success': True
        })

    except Exception as e:
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

        if not requirement_text:
            return JsonResponse({'error': 'Requirement text is required'}, status=400)

        # Generate content using Gemini API
        result = generate_user_story_and_acceptance_criteria(requirement_text)

        return JsonResponse(result)

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        return JsonResponse({'error': 'Failed to generate content'}, status=500)

def generate_user_story_and_acceptance_criteria(requirement_text):
    try:
        # Create a structured prompt for the Gemini model
        prompt = f"""
        Based on the following requirement, generate a well-structured user story and detailed acceptance criteria.

        Requirement: {requirement_text}

        Please format your response as follows:
        1. User Story: Follow the format "As a [type of user], I want [an action] so that [benefit/value]"
        2. Acceptance Criteria: Provide a numbered list of specific, testable criteria that must be met for the story to be considered complete.

        Make sure the acceptance criteria are:
        - Clear and unambiguous
        - Testable/verifiable
        - Cover both happy path and edge cases
        - Include any specific business rules or constraints
        """

        # Configure the model
        model = genai.GenerativeModel('gemini-1.5-pro')

        # Generate the response
        response = model.generate_content(prompt)

        # Process the response text
        response_text = response.text

        # Extract user story and acceptance criteria
        user_story = ""
        acceptance_criteria = []

        # Simple parsing logic - can be enhanced for more complex outputs
        sections = response_text.split("Acceptance Criteria:")

        if len(sections) > 0 and "User Story:" in sections[0]:
            user_story = sections[0].split("User Story:")[1].strip()

        if len(sections) > 1:
            criteria_text = sections[1].strip()
            # Extract numbered criteria
            for line in criteria_text.split('\n'):
                # Check if line starts with a number or a dash
                if (line.strip() and (line.strip()[0].isdigit() or line.strip()[0] == '-')):
                    # Remove the number/dash and its trailing characters
                    clean_line = line.strip()
                    if clean_line[0].isdigit():
                        # Find the position after the number and any following characters like '.' or ')'
                        pos = 0
                        while pos < len(clean_line) and (clean_line[pos].isdigit() or clean_line[pos] in '.)'):
                            pos += 1
                        clean_line = clean_line[pos:].strip()
                    else:  # Starts with dash
                        clean_line = clean_line[1:].strip()

                    acceptance_criteria.append(clean_line)

        # If parsing fails, provide a fallback
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
