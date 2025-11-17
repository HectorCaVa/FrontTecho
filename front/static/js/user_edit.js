document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const pathParts = window.location.pathname.split("/");
    const userId = pathParts[2]; // /users/3/edit → "3"

    const checkboxes = document.querySelectorAll(".perm-check");

    // ========= 1. Cargar datos del usuario ============
    async function cargarUsuario() {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/usuario/lista/", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener usuario");

            const usuarios = await response.json();
            const user = usuarios.find(u => u.id == userId);
            if (!user) throw new Error("Usuario no encontrado");

            // Rellenar inputs
            document.querySelector("input[name='first_name']").value = user.nombre || "";
            document.querySelector("input[name='last_name']").value = user.apellido_paterno || "";
            document.querySelector("input[name='apellido_materno']").value = user.apellido_materno || "";
            document.querySelector("input[name='rut']").value = user.rut || "";
            document.querySelector("input[name='email']").value = user.email || "";
            document.querySelector("input[name='telefono']").value = user.phone || "";
            document.querySelector("input[name='fecha_nacimiento']").value =  user.birthdate?.split("T")[0] || "";
            document.querySelector("select[name='sexo']").value = user.sexo || "";

        } catch (error) {
            console.error("Error al cargar usuario:", error);
            alert("No se pudieron cargar los datos del usuario.");
        }
    }

    await cargarUsuario();

    // ========= 2. Enviar actualización ============
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Convertir formulario en JSON
        const formData = new FormData(form);
        const data = { id: userId }; // obligatorio para tu endpoint

        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Agregar permisos como booleanos
        checkboxes.forEach(cb => {
            data[cb.name] = cb.checked;
        });
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/usuario/modificar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                console.warn(result);
                alert("Error al actualizar: " + (result.error));
                return;
            }

            alert("Usuario actualizado correctamente!");
            window.location.href = "/home/";

        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            alert("No se pudo actualizar el usuario. Revisa la consola.");
        }
    });
});
