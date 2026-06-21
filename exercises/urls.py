from django.urls import path

from . import views

app_name = 'exercises'

urlpatterns = [
    path('', views.home, name='home'),
    path('manual/', views.manual_exercise_create, name='manual_exercise_create'),
    path('ai/', views.ai_exercise_create, name='ai_exercise_create'),
    path('ai/correct/', views.ai_exercise_correct, name='ai_exercise_correct'),
]