from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),

    path('home/', views.home, name='home'),
    path('galeria/', views.galeria, name='galeria'),

    path('users/', views.user_index, name='user_index'),
    path('users/new/', views.user_new, name='user_new'),
    path('users/<int:id>/edit/', views.user_edit, name='user_edit'),

    path('projects/', views.project_index, name='project_index'),
    path('projects/new/', views.project_new, name='project_new'),
    path('projects/<int:id>/edit/', views.project_edit, name='project_edit'),
    path('projects/<int:id>/info/', views.project_info, name='project_info'),
]