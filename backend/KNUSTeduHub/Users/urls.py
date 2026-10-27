from django.urls import path

from Users import views


urlpatterns = [
    path("register_user/", views.register_user, name="register_user"),
    path("me/", views.current_user, name="current_user"),
]
