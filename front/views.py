from django.shortcuts import render,get_object_or_404
from datetime import datetime

def inicio(request):
    return render(request, 'inicio.html')

def home(request):
    return render(request, 'home/index.html')

def galeria(request):
    return render(request, 'galeria/index.html')

def user_new(request):
    return render(request, 'user/new.html')

def user_index(request):
    users = [
        {"id": 1, "rut": "20.123.456-7", "name": "Juan Pérez", "email": "juan@example.com", "status": "activo"},
        {"id": 2, "rut": "18.765.432-1", "name": "María López", "email": "maria@example.com", "status": "inactivo"},
        {"id": 3, "rut": "19.876.543-2", "name": "Carlos Díaz", "email": "carlos@example.com", "status": "activo"},
    ]
    return render(request, 'user/index.html', {"users": users})
    
def user_edit(request, id):
    users = [
        {"id": 1, "rut": "20.123.456-7", "name": "Juan Pérez", "email": "juan@example.com", "status": "activo"},
        {"id": 2, "rut": "18.765.432-1", "name": "María López", "email": "maria@example.com", "status": "inactivo"},
        {"id": 3, "rut": "19.876.543-2", "name": "Carlos Díaz", "email": "carlos@example.com", "status": "activo"},
    ]

    user = next((u for u in users if u["id"] == id), None)
    if not user:
        return render(request, "user/not_found.html")

    permisos = [
        {"name": "Usuario", "view": True, "edit": False, "delete": False},
        {"name": "Proyecto", "view": True, "edit": True, "delete": False},
        {"name": "Comentarios", "view": True, "edit": False, "delete": True},
    ]

    return render(request, "user/edit.html", {"user": user, "permisos": permisos})

def project_index(request):
    projects = [
        {"id": 1, "name": "Proyecto A", "client": "Cliente X", "start_date": "2025-10-01", "status": "Inicio"},
        {"id": 2, "name": "Proyecto B", "client": "Cliente Y", "start_date": "2025-09-15", "status": "Aceptado"},
        {"id": 3, "name": "Proyecto C", "client": "Cliente Z", "start_date": "2025-08-20", "status": "Proceso"},
    ]
    # Agregar días transcurridos
    today = datetime.today().date()
    for project in projects:
        project_date = datetime.strptime(project["start_date"], "%Y-%m-%d").date()
        project["days_passed"] = (today - project_date).days

    return render(request, 'proyectos/index.html', {"projects": projects})

def project_new(request):
    return render(request, "proyectos/new.html")

def project_edit(request, id):
    project = {"id": id, "name": "Proyecto X", "status": "inicio", "date": "2025-10-30"}
    return render(request, "proyectos/edit.html", {"project": project})