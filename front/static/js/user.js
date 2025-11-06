document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById("userTableBody");
    const searchInput = document.getElementById("searchInput");

    const token = localStorage.getItem("token");

    // === 1. OBTENER USUARIOS DEL ENDPOINT ===
    async function cargarUsuarios() {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/usuario/lista/", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `token ${token}` // quita si tu endpoint no usa token
                }
            });

            if (!response.ok) throw new Error("Error al cargar usuarios");

            const data = await response.json();
            mostrarUsuarios(data);

        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            tableBody.innerHTML = `<tr><td colspan="6" class="has-text-centered">Error al cargar usuarios</td></tr>`;
        }
    }

    // === 2. MOSTRAR USUARIOS EN LA TABLA ===
    function mostrarUsuarios(lista) {
        tableBody.innerHTML = "";

        if (!lista.length) {
            tableBody.innerHTML = `<tr><td colspan="6" class="has-text-centered">No hay usuarios registrados</td></tr>`;
            return;
        }

        lista.forEach(user => {
            const fila = document.createElement("tr");

            const nombreCompleto = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`;
            const estado = user.esta_activo
                ? `<span class="tag is-success" style="color:white">Activo</span>`
                : `<span class="tag is-danger" style="color:white">Inactivo</span>`;

            // Botones según estado
            const botonDesactivar = user.esta_activo
                ? `<button class="button is-small is-danger btn-toggle" style="color: white;" data-id="${user.id}" data-action="desactivar" title="Desactivar usuario">
                       <span class="icon"><i class="fas fa-trash"></i></span>
                   </button>`
                : ``;

            const botonActivar = !user.esta_activo
                ? `<button class="button is-small is-success btn-toggle" style="color: white;" data-id="${user.id}" data-action="activar" title="Activar usuario">
                       <span class="icon"><i class="fas fa-check"></i></span>
                   </button>`
                : ``;

            fila.innerHTML = `
                <td>${user.id}</td>
                <td>${user.rut}</td>
                <td>${nombreCompleto}</td>
                <td>${user.email}</td>
                <td>${estado}</td>
                <td>
                    <a href="/users/${user.id}/edit/" class="button is-small is-info" style="color: white;" title="Editar usuario">
                        <span class="icon"><i class="fas fa-edit"></i></span>
                    </a>
                    ${botonDesactivar}
                    ${botonActivar}
                </td>
            `;

            tableBody.appendChild(fila);
        });

        aplicarFiltro();
    }

    // === 3. FILTRO DE BÚSQUEDA ===
    function aplicarFiltro() {
        const rows = tableBody.getElementsByTagName("tr");

        searchInput.addEventListener("keyup", function () {
            const filter = searchInput.value.toLowerCase();

            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                let match = false;

                for (let j = 0; j < cells.length - 1; j++) { // excluir columna de acciones
                    if (cells[j].textContent.toLowerCase().includes(filter)) {
                        match = true;
                        break;
                    }
                }

                rows[i].style.display = match ? "" : "none";
            }
        });
    }

    // === 4. ACTIVAR / DESACTIVAR USUARIO ===
    tableBody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-toggle");
        if (!btn) return;

        const userId = btn.dataset.id;
        const action = btn.dataset.action; // "activar" o "desactivar"

        const url = action === "activar"
            ? `http://127.0.0.1:8000/solicitudes/usuario/activar_usuario/`
            : `http://127.0.0.1:8000/solicitudes/usuario/desactivar_usuario/`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `token ${token}`
                },
                body: JSON.stringify({ id: userId })
            });

            if (!response.ok) throw new Error("Error en la solicitud");

            alert(`Usuario ${action} correctamente`);
            cargarUsuarios(); // recarga la tabla después de cambiar estado

        } catch (error) {
            console.error("Error al cambiar estado:", error);
            alert("No se pudo cambiar el estado del usuario");
        }
    });

    // === 5. CARGAR USUARIOS AL INICIO ===
    cargarUsuarios();
});
