document.addEventListener("DOMContentLoaded", function() {
  const status = document.getElementById("projectStatus").value;
  const timeline = document.querySelector(".project-timeline");
  const steps = Array.from(document.querySelectorAll(".project-timeline .step"));

  // Si está anulado → todo rojo
  if (status === "Anulado") {
    timeline.classList.add("red");
    return;
  }

  // Limpiar clases
  steps.forEach(step => {
    step.querySelector(".circle").className = "circle";
    const connector = step.querySelector(".connector");
    if (connector) connector.className = "connector";
  });

  const currentIndex = steps.findIndex(step => step.dataset.status === status);

  steps.forEach((step, index) => {
    const circle = step.querySelector(".circle");
    const connector = step.querySelector(".connector");

    if (index < currentIndex) {
      // Pasos anteriores → verde
      circle.classList.add("active");
      if (connector) connector.classList.add("completed");
    } else if (index === currentIndex) {
      // Paso actual → verde
      circle.classList.add("active");
      if (connector && steps[index + 1]) connector.classList.add("connector-next"); 
    } else if (index === currentIndex + 1) {
      // Siguiente paso → naranja pulsante en círculo
      circle.classList.add("pulsing");
      if (connector) connector.classList.add("future"); // gris
    } else {
      // Todos los posteriores → gris
      circle.style.backgroundColor = "#555";
      if (connector) connector.classList.add("future");
    }
  });
});
