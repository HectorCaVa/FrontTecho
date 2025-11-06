document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token"); // si tu endpoint requiere token

    // === 1. Obtener ID del usuario desde la URL ===
    const pathParts = window.location.pathname.split("/");
    const userId = pathParts[2];

    // === 2. Traer datos del usuario ===
    try {
        const response = await fetch(`http://127.0.0.1:8000/solicitudes/usuario/lista/`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${token}`
            },
        });

        if (!response.ok) throw new Error("Error al obtener usuario");

        const usuarios = await response.json(); // lista completa
        const user = usuarios.find(u => u.id == userId);
        if (!user) throw new Error("Usuario no encontrado");

        // === 3. Rellenar los inputs ===
        document.querySelector("input[name='name']").value = user.nombre || "";
        document.querySelector("input[name='apellido_paterno']").value = user.apellido_paterno || "";
        document.querySelector("input[name='apellido_materno']").value = user.apellido_materno || "";
        document.querySelector("input[name='rut']").value = user.rut || "";
        document.querySelector("input[name='email']").value = user.email || "";
        document.querySelector("input[name='phone']").value = user.phone || "";
        document.querySelector("input[name='birthdate']").value = user.birthdate || "";
        document.querySelector("select[name='sexo']").value = user.sexo || "";

        // Si tienes permisos, podrías cargarlos también aquí
        // Por ahora se mantienen los que están renderizados en el template
    } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("No se pudieron cargar los datos del usuario.");
    }


    // === 5. Enviar formulario vía AJAX ===
    const form = document.querySelector("form");
    form.addEventListener("submit", async function(e) {
        e.preventDefault(); // prevenir recarga

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Agregar permisos como booleanos
        checkboxes.forEach(cb => {
            data[cb.name] = cb.checked;
        });

        try {
            const response = await fetch(window.location.href, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `token ${token}` // quitar si no necesitas
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Error al actualizar usuario");

            const result = await response.json();
            alert("Usuario actualizado correctamente!");
            window.location.href = "/users/"; // redirigir al listado
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            alert("No se pudo actualizar el usuario. Revisa la consola.");
        }
    });
});
