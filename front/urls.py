from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('user/', views.user_index, name='user_index'),
    path('user/new/', views.user_new, name='user_new'),
    path('user/edit/<int:id>/', views.user_edit, name='user_edit'),
    path('proyectos/', views.project_index, name='project_index'),
    path('proyectos/new/', views.project_new, name='project_new'),
    path('proyectos/edit/<int:id>/', views.project_edit, name='project_edit'),
]