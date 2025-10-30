document.addEventListener("DOMContentLoaded", function () {
    const projectFilesInput = document.getElementById("projectFiles");
    const filesTableBody = document.querySelector("#filesTable tbody");

    // Manejo de archivos nuevos
    projectFilesInput.addEventListener("change", function (event) {
        Array.from(event.target.files).forEach((file) => {
            const row = document.createElement("tr");

            // Nombre del archivo
            const nameCell = document.createElement("td");
            nameCell.textContent = file.name;
            row.appendChild(nameCell);

            // Acciones
            const actionCell = document.createElement("td");

            // Botón Ver
            const viewBtn = document.createElement("button");
            viewBtn.textContent = "Ver";
            viewBtn.className = "button is-small is-info mr-2";
            viewBtn.onclick = () => {
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, "_blank");
            };
            actionCell.appendChild(viewBtn);

            // Botón Eliminar
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Eliminar";
            deleteBtn.className = "button is-small is-danger";
            deleteBtn.onclick = () => row.remove();
            actionCell.appendChild(deleteBtn);

            row.appendChild(actionCell);
            filesTableBody.appendChild(row);
        });
    });

    // Manejo de archivos existentes
    document.querySelectorAll(".existing-file").forEach((btn) => {
        btn.addEventListener("click", function () {
            const row = btn.closest("tr");
            
            // Marcar para eliminar
            const inputDelete = document.createElement("input");
            inputDelete.type = "hidden";
            inputDelete.name = "delete_files[]";
            inputDelete.value = btn.dataset.fileId; // id del archivo
            document.querySelector("form").appendChild(inputDelete);

            // Eliminar fila de la tabla
            row.remove();
        });
    });
});
