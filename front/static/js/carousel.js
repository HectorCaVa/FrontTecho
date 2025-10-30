document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.carousel-item');
    let current = 0;

    setInterval(() => {
        items[current].style.opacity = 0;
        current = (current + 1) % items.length;
        items[current].style.opacity = 1;
    }, 5000); // cambia cada 5 segundos
});
