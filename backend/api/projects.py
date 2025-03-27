import pymongo
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from bson import ObjectId
from datetime import datetime
import base64
import requests
from bs4 import BeautifulSoup

# MongoDB Connection
MONGO_URI = "mongodb+srv://1QoSRtE75wSEibZJ:1QoSRtE75wSEibZJ@cluster0.mregq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGO_DB_NAME = "Todo_Lister"

# MongoDB Client
client = pymongo.MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
projects_collection = db['Projects']

@csrf_exempt
def create_project(request):
    """
    Create a new project with initial conversation
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            project = {
                'name': data.get('name', 'Untitled Project'),
                'description': data.get('description', ''),
                'conversations': [],
                'created_at': datetime.utcnow()
            }

            # Insert first conversation if provided
            if data.get('initial_conversation'):
                conversation = {
                    '_id': str(ObjectId()),
                    'content': data['initial_conversation'],
                    'timestamp': datetime.utcnow(),
                    'role': 'user'
                }
                project['conversations'].append(conversation)

            result = projects_collection.insert_one(project)
            return JsonResponse({
                'message': 'Project created successfully',
                'project_id': str(result.inserted_id)
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def add_conversation(request, project_id):
    """
    Add a conversation to an existing project
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            conversation = {
                '_id': str(ObjectId()),
                'content': data.get('content', ''),
                'timestamp': datetime.utcnow(),
                'role': data.get('role', 'user')
            }

            result = projects_collection.update_one(
                {'_id': ObjectId(project_id)},
                {'$push': {'conversations': conversation}}
            )

            if result.modified_count:
                return JsonResponse({
                    'message': 'Conversation added successfully',
                    'conversation_id': conversation['_id']
                }, status=201)
            else:
                return JsonResponse({'error': 'Project not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def get_project_conversations(request, project_id):
    """
    Retrieve all conversations for a specific project
    """
    if request.method == 'GET':
        try:
            project = projects_collection.find_one({'_id': ObjectId(project_id)})

            if project:
                conversations = project.get('conversations', [])
                # Convert ObjectId to string for JSON serialization
                for conv in conversations:
                    conv['_id'] = str(conv['_id'])
                    conv['timestamp'] = conv['timestamp'].isoformat()

                return JsonResponse({
                    'project_name': project.get('name', 'Unnamed Project'),
                    'conversations': conversations
                })
            else:
                return JsonResponse({'error': 'Project not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def list_projects(request):
    """
    List all projects
    """
    if request.method == 'GET':
        try:
            projects = list(projects_collection.find())

            # Convert ObjectId to string
            for project in projects:
                project['_id'] = str(project['_id'])
                project['created_at'] = project['created_at'].isoformat()

            return JsonResponse({'projects': projects})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def upload_image(request, project_id):
    """
    Upload an image to a project conversation
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_data = data.get('image')

            conversation = {
                '_id': str(ObjectId()),
                'content': image_data,  # Store as base64 string
                'timestamp': datetime.utcnow(),
                'role': 'user',
                'type': 'image'
            }

            result = projects_collection.update_one(
                {'_id': ObjectId(project_id)},
                {'$push': {'conversations': conversation}}
            )

            if result.modified_count:
                return JsonResponse({
                    'message': 'Image added successfully',
                    'conversation_id': conversation['_id']
                }, status=201)
            else:
                return JsonResponse({'error': 'Project not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def get_link_preview(request, project_id):
    """
    Get link preview for a URL
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            url = data.get('url')

            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')

            title = soup.find('title').text if soup.find('title') else 'No Title'
            description = soup.find('meta', attrs={'name': 'description'})
            description = description['content'] if description else 'No Description'
            image = soup.find('meta', property='og:image')
            image = image['content'] if image else ''

            preview = {
                'title': title,
                'description': description,
                'image': image
            }

            return JsonResponse(preview)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_conversation(request, project_id, conversation_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            result = projects_collection.update_one(
                {
                    '_id': ObjectId(project_id),
                    'conversations._id': conversation_id
                },
                {
                    '$set': {
                        'conversations.$.content': data.get('content', '')[:500],
                        'conversations.$.timestamp': datetime.utcnow()
                    }
                }
            )

            if result.modified_count:
                return JsonResponse({'message': 'Conversation updated successfully'})
            else:
                return JsonResponse({'error': 'Conversation not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def delete_conversation(request, project_id, conversation_id):
    if request.method == 'DELETE':
        try:
            result = projects_collection.update_one(
                {'_id': ObjectId(project_id)},
                {'$pull': {'conversations': {'_id': conversation_id}}}
            )

            if result.modified_count:
                return JsonResponse({'message': 'Conversation deleted successfully'})
            else:
                return JsonResponse({'error': 'Conversation not found'}, status=404)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
