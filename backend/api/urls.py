from django.urls import path
from .views import *
from .tasks import *
from .attendance import *
from .projects import *
from .ai import *

urlpatterns = [
    path("login", login_user, name="login"),
    path('sendotp', send_otp, name='send_otp'),
    path('verifyotp', verify_otp, name='verify_otp'),
    path('resetpassword', reset_password, name='reset_password'),
    path('createaccount', createaccount, name='create_account'),
    path('forgot-opt', forgot_send_otp, name='forgot-opt'),
    path('activities', UserActivitiesView.as_view(), name='user-activities'),
    path('record_attendance', record_attendance, name='record_attendance'),
    path('get_today_attendance', get_today_attendance, name='get_today_attendance'),

    path('create/', create_project, name='create_project'),
    path('projects/', list_projects, name='list_projects'),
    path('<str:project_id>/conversations/', get_project_conversations, name='get_project_conversations'),
    path('<str:project_id>/add-conversation/', add_conversation, name='add_conversation'),
    path('<str:project_id>/upload-image/', upload_image, name='upload_image'),
    path('<str:project_id>/link-preview/', get_link_preview, name='get_link_preview'),

    path('<str:project_id>/edit-conversation/<str:conversation_id>/', edit_conversation, name='edit_conversation/'),
    path('<str:project_id>/delete-conversation/<str:conversation_id>/', delete_conversation, name='delete_conversation/'),

    path('chatbot/', chatbot_view, name='chatbot'),

    path('generate-content/', generate_content, name='generate_content'),
    path('save-content/', save_content, name='save_content'),
    path('get-saved-contents/', get_saved_contents, name='get_saved_contents'),
    
    path('generate-mail/', generate_mail, name='generate_mail'),

    
    

    
]
