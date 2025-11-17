document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login/";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token"); //
      window.location.href = "/login/"; //
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const btnUser = document.getElementById("btnUser");

    // Leer el user_id desde localStorage
    const userId = localStorage.getItem("user_id");

    if (userId) {
        // Agregar evento click para redirigir al perfil del usuario
        btnUser.addEventListener("click", () => {
            window.location.href = `/users/${userId}/edit/`;
        });
    } else {
        console.warn("No se encontró user_id en localStorage");
    }
});
