from django.urls import path
from .views import login_user, send_otp, verify_otp, reset_password, createaccount, forgot_send_otp
from .tasks import UserActivitiesView

urlpatterns = [
    path("login", login_user, name="login"),
    path('sendotp', send_otp, name='send_otp'),
    path('verifyotp', verify_otp, name='verify_otp'),
    path('resetpassword', reset_password, name='reset_password'),
    path('createaccount', createaccount, name='create_account'),
    path('forgot-opt', forgot_send_otp, name='forgot-opt'),
    path('activities', UserActivitiesView.as_view(), name='user-activities')
]
