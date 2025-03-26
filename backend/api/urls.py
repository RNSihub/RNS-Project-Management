from django.urls import path
from .views import *
from .tasks import *
from .attendance import *

urlpatterns = [
    path("login", login_user, name="login"),
    path('sendotp', send_otp, name='send_otp'),
    path('verifyotp', verify_otp, name='verify_otp'),
    path('resetpassword', reset_password, name='reset_password'),
    path('createaccount', createaccount, name='create_account'),
    path('forgot-opt', forgot_send_otp, name='forgot-opt'),
    path('activities', UserActivitiesView.as_view(), name='user-activities'),
    path('record_attendance', record_attendance, name='record_attendance'),
    path('get_today_attendance', get_today_attendance, name='get_today_attendance')
]
