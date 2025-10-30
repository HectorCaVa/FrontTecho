document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const dateInput = document.getElementById("dateFilter");
    const statusSelect = document.getElementById("statusFilter");
    const table = document.getElementById("projectsTable");
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    function filterTable() {
        const searchValue = searchInput.value.toLowerCase();
        const dateValue = dateInput.value;
        const statusValue = statusSelect.value;

        for (let i = 0; i < rows.length; i++) {
            let cells = rows[i].getElementsByTagName("td");
            let match = true;

            // Filtrado general (busqueda en todos los td)
            if (searchValue) {
                let found = false;
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].textContent.toLowerCase().includes(searchValue)) {
                        found = true;
                        break;
                    }
                }
                if (!found) match = false;
            }

            // Filtrado por fecha (asume columna 2 es fecha)
            if (dateValue) {
                const rowDate = cells[2].textContent.trim(); 
                if (rowDate !== dateValue) match = false;
            }

            // Filtrado por estado (asume columna 3 es estado)
            if (statusValue) {
                const rowStatus = cells[3].textContent.trim();
                if (rowStatus !== statusValue) match = false;
            }

            rows[i].style.display = match ? "" : "none";
        }
    }

    searchInput.addEventListener("keyup", filterTable);
    dateInput.addEventListener("change", filterTable);
    statusSelect.addEventListener("change", filterTable);
});
document.getElementById('projectFiles').addEventListener('change', function(event) {
    const filesTableBody = document.querySelector('#filesTable tbody');
    filesTableBody.innerHTML = ''; // limpiar tabla antes de agregar

    Array.from(event.target.files).forEach((file, index) => {
        const row = document.createElement('tr');

        // Nombre del archivo
        const nameCell = document.createElement('td');
        nameCell.textContent = file.name;
        row.appendChild(nameCell);

        // Acciones
        const actionCell = document.createElement('td');

        // Botón Ver
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'Ver';
        viewBtn.className = 'button is-small is-info mr-2';
        viewBtn.onclick = () => {
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        };
        actionCell.appendChild(viewBtn);

        // Botón Eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'button is-small is-danger';
        deleteBtn.onclick = () => row.remove();
        actionCell.appendChild(deleteBtn);

        row.appendChild(actionCell);
        filesTableBody.appendChild(row);
    });
});