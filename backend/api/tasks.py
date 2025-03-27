from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from djongo import models
from datetime import datetime
from bson import ObjectId  # For ObjectId handling in MongoDB

# MongoDB URI and Database Settings
MONGO_URI = "mongodb+srv://1QoSRtE75wSEibZJ:1QoSRtE75wSEibZJ@cluster0.mregq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGO_DB_NAME = "Todo_Lister"
MONGO_JOBS_COLLECTION = "Tasks"
MONGO_ACTIVITIES_COLLECTION = "Activities"


# Helper function to fetch tasks from the MongoDB
def fetch_tasks():
    try:
        # Query the MongoDB collection
        tasks = models.DjongoCollection(MONGO_JOBS_COLLECTION).objects.all()
        task_list = [
            {
                '_id': str(task['_id']),
                'title': task['title'],
                'description': task['description'],
                'assignedTo': task['assignedTo'],
                'status': task['status'],
                'priority': task['priority'],
                'deadline': task['deadline'],
                'created_at': task['created_at'],
            }
            for task in tasks
        ]
        return task_list
    except Exception as e:
        return {"error": str(e)}

# GET all tasks
@api_view(['GET'])
def get_tasks(request):
    tasks = fetch_tasks()
    if 'error' in tasks:
        return Response({"error": tasks['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(tasks)

# POST (Create) a new task
@api_view(['POST'])
def create_task(request):
    if request.method == 'POST':
        try:
            data = request.data  # Get the incoming data from the request
            
            # Ensure all required fields are present
            if not all(key in data for key in ['title', 'description', 'assignedTo', 'status', 'priority', 'deadline']):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare the task data
            task_data = {
                'title': data['title'],
                'description': data['description'],
                'assignedTo': data['assignedTo'],
                'status': data.get('status', 'Pending'),
                'priority': data.get('priority', 'Medium'),
                'deadline': data['deadline'],
                'created_at': datetime.now()
            }

            # Insert task into MongoDB
            task = models.DjongoCollection(MONGO_JOBS_COLLECTION).objects.create(**task_data)

            # Return the newly created task
            return Response({
                '_id': str(task['_id']),
                'title': task['title'],
                'description': task['description'],
                'assignedTo': task['assignedTo'],
                'status': task['status'],
                'priority': task['priority'],
                'deadline': task['deadline'],
                'created_at': task['created_at']
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# PUT (Update) an existing task
@api_view(['PUT'])
def update_task(request, task_id):
    try:
        # Find task by ID
        task = models.DjongoCollection(MONGO_JOBS_COLLECTION).objects.get(_id=ObjectId(task_id))
        
        if request.method == 'PUT':
            data = request.data  # Get updated data

            # Update fields
            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.assignedTo = data.get('assignedTo', task.assignedTo)
            task.status = data.get('status', task.status)
            task.priority = data.get('priority', task.priority)
            task.deadline = data.get('deadline', task.deadline)
            task.save()  # Save updated task
            
            return Response({
                '_id': str(task['_id']),
                'title': task['title'],
                'description': task['description'],
                'assignedTo': task['assignedTo'],
                'status': task['status'],
                'priority': task['priority'],
                'deadline': task['deadline'],
                'created_at': task['created_at']
            })
    except models.DjongoCollection.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DELETE a task
@api_view(['DELETE'])
def delete_task(request, task_id):
    try:
        task = models.DjongoCollection(MONGO_JOBS_COLLECTION).objects.get(_id=ObjectId(task_id))  # Find the task by ID
        if request.method == 'DELETE':
            task.delete()  # Delete task
            return Response(status=status.HTTP_204_NO_CONTENT)  # Return HTTP 204 No Content
    except models.DjongoCollection.DoesNotExist:
        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# GET recent tasks (fetching the 5 most recent tasks)
@api_view(['GET'])
def get_recent_tasks(request):
    try:
        tasks = models.DjongoCollection(MONGO_JOBS_COLLECTION).objects.all().order_by('-created_at')[:5]  # Get 5 most recent tasks
        recent_task_data = [
            {
                '_id': str(task['_id']),
                'title': task['title'],
                'description': task['description'],
                'assignedTo': task['assignedTo'],
                'status': task['status'],
                'priority': task['priority'],
                'deadline': task['deadline'],
                'created_at': task['created_at'],
            }
            for task in tasks
        ]
        return Response(recent_task_data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
