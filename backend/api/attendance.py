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
import pytz

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
meetings_collection = db[os.getenv("MONGO_MEETINGS_COLLECTION")]
Tasks_collection = db[os.getenv("MONGO_JOBS_COLLECTION")]
attendance_collection = db['Attendance']

# In-memory storage for OTPs

@csrf_exempt
def record_attendance(request):
    """
    Handle attendance recording for different types of check-ins/check-outs
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            username = data.get('username')
            attendance_type = data.get('attendance_type')

            if not email or not username or not attendance_type:
                return JsonResponse({'status': 'error', 'message': 'Missing required parameters'}, status=400)

            if attendance_type not in ['office_in', 'office_out', 'break_in', 'break_out', 'lunch_in', 'lunch_out']:
                return JsonResponse({'status': 'error', 'message': 'Invalid attendance type'}, status=400)

            ist = pytz.timezone('Asia/Kolkata')
            current_time = datetime.now(ist)

            attendance_record = {
                'email': email,
                'username': username,
                'date': current_time.date().isoformat(),
                'timestamp': current_time.isoformat(),
                'attendance_type': attendance_type
            }

            result = attendance_collection.insert_one(attendance_record)

            return JsonResponse({'status': 'success', 'message': f'{attendance_type.capitalize()} recorded successfully', 'record_id': str(result.inserted_id)})

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'An error occurred while recording attendance'}, status=500)

    elif request.method == 'GET':
        try:
            email = request.GET.get('email')

            if not email:
                return JsonResponse({'status': 'error', 'message': 'Missing email parameter'}, status=400)

            records = list(attendance_collection.find({'email': email}).sort('timestamp', -1))

            for record in records:
                record['_id'] = str(record['_id'])

            return JsonResponse({'status': 'success', 'records': records})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'An error occurred while retrieving attendance records'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def get_today_attendance(request):
    """
    Get today's attendance summary for a user
    """
    if request.method == 'GET':
        try:
            email = request.GET.get('email')

            if not email:
                return JsonResponse({'status': 'error', 'message': 'Missing email parameter'}, status=400)

            ist = pytz.timezone('Asia/Kolkata')
            today = datetime.now(ist).date()

            today_records = list(attendance_collection.find({
                'email': email,
                'date': today.isoformat(),
            }).sort('timestamp', 1))

            attendance_summary = {
                'office_in': None,
                'office_out': None,
                'break_in': None,
                'break_out': None,
                'lunch_in': None,
                'lunch_out': None
            }

            for record in today_records:
                attendance_type = record['attendance_type']
                attendance_summary[attendance_type] = record['timestamp']

            return JsonResponse({'status': 'success', 'attendance': attendance_summary})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'An error occurred while retrieving today\'s attendance'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
