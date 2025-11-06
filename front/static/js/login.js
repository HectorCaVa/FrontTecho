document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    message.textContent = "Conectando...";
    message.style.color = "gray";

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        message.textContent = "Error de conexión con el servidor.";
        message.style.color = "red";
        return;
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        message.textContent = "Inicio de sesión exitoso";
        message.style.color = "green";
        setTimeout(() => {
          window.location.href = "/home/";
        }, 1000);
      } else {
        message.textContent = "Credenciales incorrectas";
        message.style.color = "red";
      }
    } catch (error) {
      message.textContent = "Error al conectar con el servidor.";
      message.style.color = "red";
    }
  });
});
