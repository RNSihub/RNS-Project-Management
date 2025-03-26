from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt

# MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
meetings_collection = db[os.getenv("MONGO_MEETINGS_COLLECTION")]
Tasks_collection = db[os.getenv("MONGO_JOBS_COLLECTION")]
Activities_collection = db[os.getenv("MONGO_ACTIVITIES_COLLECTION")]

class UserActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve recent user activities
        """
        # Get activities from the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)

        activities = list(Activities_collection.find({
            'user_id': str(request.user.id),
            'timestamp': {'$gte': thirty_days_ago}
        }).sort('timestamp', -1).limit(10))

        # Convert ObjectId to string
        for activity in activities:
            activity['_id'] = str(activity['_id'])

        return Response(activities)

    def log_activity(self, user_id, activity_type, description):
        """
        Log a new user activity
        """
        activity = {
            'user_id': str(user_id),
            'type': activity_type,
            'description': description,
            'timestamp': datetime.now()
        }

        Activities_collection.insert_one(activity)

# Modify existing TaskView to log activities
class TaskView(APIView):
    def post(self, request):
        """
        Override post method to log task creation activity
        """
        # Existing task creation logic
        task_data = request.data.copy()
        task_data['created_by_id'] = str(request.user.id)
        task_data['created_at'] = datetime.now()
        task_data['updated_at'] = datetime.now()

        result = Tasks_collection.insert_one(task_data)
        task_data['_id'] = str(result.inserted_id)

        # Log activity
        UserActivitiesView().log_activity(
            request.user.id,
            'task_created',
            f'Created task: {task_data["title"]}'
        )

        return Response(task_data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        """
        Override put method to log task update activity
        """
        # Existing update logic
        update_data = request.data.copy()
        update_data['updated_at'] = datetime.now()

        result = Tasks_collection.update_one(
            {'_id': ObjectId(pk)},
            {'$set': update_data}
        )

        if result.modified_count:
            updated_task = Tasks_collection.find_one({'_id': ObjectId(pk)})
            updated_task['_id'] = str(updated_task['_id'])

            # Log activity
            UserActivitiesView().log_activity(
                request.user.id,
                'task_updated',
                f'Updated task: {updated_task["title"]}'
            )

            return Response(updated_task)

        return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
