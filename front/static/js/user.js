document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const table = document.getElementById("usersTable");
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    searchInput.addEventListener("keyup", function () {
        const filter = searchInput.value.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            let cells = rows[i].getElementsByTagName("td");
            let match = false;

            for (let j = 0; j < cells.length - 1; j++) { // excluye la columna de acciones
                if (cells[j].textContent.toLowerCase().includes(filter)) {
                    match = true;
                    break;
                }
            }

            rows[i].style.display = match ? "" : "none";
        }
    });
});
