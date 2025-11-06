document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("userForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const data = {
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
            first_name: document.getElementById("first_name").value.trim(),
            last_name: document.getElementById("last_name").value.trim(),
            apellido_materno: document.getElementById("apellido_materno").value.trim(),
            rut: document.getElementById("rut").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            fecha_nacimiento: document.getElementById("fecha_nacimiento").value || null,
            sexo: document.getElementById("sexo").value
        };

        // Validación básica
        if (!data.email || !data.password || !data.first_name || !data.last_name) {
            alert("Por favor completa los campos obligatorios (nombre, apellido, email, contraseña).");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error:", errorData);
                alert("Error al registrar el usuario: " + (errorData.detail || "verifica los datos ingresados"));
                return;
            }

            const result = await response.json();
            console.log("Usuario creado:", result);

            alert("Usuario registrado correctamente");
            window.location.href = "/users/"; // redirige al listado de usuarios

        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert("Error al conectar con el servidor.");
        }
    });
});
