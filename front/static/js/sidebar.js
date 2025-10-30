document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const sidebar = document.getElementById('sidebar');
    const body = document.body;

    burger.addEventListener('click', () => {
        // Toggle universal, funciona en móvil y escritorio
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('show');
        body.classList.toggle('sidebar-hidden');
    });
});
