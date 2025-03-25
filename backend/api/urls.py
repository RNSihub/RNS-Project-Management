from django.urls import path
from .views import *

urlpatterns = [
    path("login", login_user, name="login"),
    path('sendotp', send_otp, name='send_otp'),
    path('verifyotp', verify_otp, name='verify_otp'),
    path('resetpassword', reset_password, name='reset_password'),
    path('createaccount', createaccount, name='create_account'),
    path('forgot-opt', forgot_send_otp , name='forgot-opt')
]
