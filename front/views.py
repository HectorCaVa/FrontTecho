from django.shortcuts import render, get_object_or_404, redirect
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# ------------------------------
# LOGIN / LOGOUT
# ------------------------------

def login_view(request):
    """
    Vista de inicio de sesión
    """
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')  # redirige a la vista principal tras iniciar sesión
        else:
            messages.error(request, 'Usuario o contraseña incorrectos')

    return render(request, 'login.html')  # tu template está en front/templates/login.html


def logout_view(request):
    """
    Cierra la sesión y redirige al login
    """
    logout(request)
    return redirect('login')


# ------------------------------
# VISTAS PRINCIPALES
# ------------------------------

@login_required(login_url='login')
def dashboard(request):
    """
    Vista principal protegida (solo usuarios logueados)
    """
    return render(request, 'front/inicio.html')


def home(request):
    return render(request, 'home/index.html')


def galeria(request):
    return render(request, 'galeria/index.html')


# ------------------------------
# VISTAS DE USUARIO
# ------------------------------

def user_new(request):
    return render(request, 'user/new.html')


def user_index(request):
    return render(request, 'user/index.html')


def user_edit(request, id):
    permisos = [
        {"name": "Usuario", "view": True, "edit": False, "delete": False},
        {"name": "Proyecto", "view": True, "edit": True, "delete": False},
        {"name": "Comentarios", "view": True, "edit": False, "delete": True},
    ]

    return render(request, "user/edit.html", {"permisos": permisos})


# ------------------------------
# VISTAS DE PROYECTOS
# ------------------------------


def project_index(request):
    return render(request, 'proyectos/index.html')


def project_new(request):
    return render(request, "proyectos/new.html")


def project_edit(request, id):
    return render(request, "proyectos/edit.html")


def project_info(request, id):
    return render(request, "proyectos/info.html")
