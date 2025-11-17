document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    message.textContent = "Conectando...";
    message.style.color = "gray";

    try {
      // === 1. LOGIN ===
      const loginResponse = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.token) {
        message.textContent = "Credenciales incorrectas";
        message.style.color = "red";
        return;
      }

      const token = loginData.token;
      localStorage.setItem("token", token);

      // === 2. OBTENER USUARIO DESDE LISTA ===
      const usersResponse = await fetch("http://127.0.0.1:8000/solicitudes/usuario/lista/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        }
      });

      if (!usersResponse.ok) {
        message.textContent = "Error obteniendo datos del usuario";
        message.style.color = "red";
        return;
      }

      const users = await usersResponse.json();

      // Buscar usuario por email para obtener su ID
      const user = users.find(u => u.email === email);

      if (!user) {
        message.textContent = "No se encontró el usuario en la lista.";
        message.style.color = "red";
        return;
      }

      // Guardar id
      localStorage.setItem("user_id", user.id);

      // Éxito
      message.textContent = "Inicio de sesión exitoso";
      message.style.color = "green";

      setTimeout(() => {
        window.location.href = "/home/";
      }, 800);

    } catch (error) {
      console.error(error);
      message.textContent = "Error al conectar con el servidor.";
      message.style.color = "red";
    }
  });
});
