from django.urls import path
from .views import *
from .tasks import *
from .attendance import *
from django.urls import re_path

urlpatterns = [
    # Existing paths
    path("login/", login_user, name="login"),
    path('sendotp/', send_otp, name='send_otp'),
    path('verifyotp/', verify_otp, name='verify_otp'),
    path('resetpassword/', reset_password, name='reset_password'),
    path('createaccount/', createaccount, name='create_account'),
    path('googlelogin/', google_login, name='google_login'),
    path('googlesignup/', google_signup, name='google_signup'),
    path('forgot-otp/', forgot_send_otp, name='forgot-otp'),
    path('record_attendance/', record_attendance, name='record_attendance'),
    path('get_today_attendance/', get_today_attendance, name='get_today_attendance'),
    
    # Task CRUD paths
  path('create/', create_task, name='create_task'),
    path('tasks/update/<str:task_id>/', update_task, name='update_task'),
    path('tasks/delete/<str:task_id>/', delete_task, name='delete_task'),
    path('tasks/recent/',get_recent_tasks, name='get_recent_tasks'),  # Add this line for recent tasks
]
