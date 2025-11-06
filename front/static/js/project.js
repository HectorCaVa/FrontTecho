document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página");
        window.location.href = "/login/";
        return;
    }

    const tableBody = document.querySelector("#projectsTable tbody");
    const searchInput = document.getElementById("searchInput");
    const dateInput = document.getElementById("dateFilter");
    const statusSelect = document.getElementById("statusFilter");

    let estadosMap = {}; // Mapa de estado_id -> estado_nombre

    // === CARGAR ESTADOS DESDE EL BACK ===
    async function cargarEstados() {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/estado/filtrar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener los estados");

            const data = await response.json();
            const estados = data.estados || [];

            // Limpiar select y agregar opción por defecto
            statusSelect.innerHTML = `<option value="">Todos los estados</option>`;

            estados.forEach(estado => {
                estadosMap[estado.estado_id] = estado.estado_nombre; // Guardar en el mapa

                const option = document.createElement("option");
                option.value = estado.estado_id;
                option.textContent = estado.estado_nombre;
                statusSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error al cargar estados:", error);
            statusSelect.innerHTML = `<option value="">Error al cargar</option>`;
        }
    }

    // === CARGAR SOLICITUDES DESDE EL BACK ===
    async function cargarSolicitudes(filtros = {}) {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/filtrar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(filtros)
            });

            if (!response.ok) throw new Error("Error al obtener datos del servidor");

            const data = await response.json();
            mostrarSolicitudes(data);

        } catch (error) {
            console.error("Error al cargar solicitudes:", error);
            tableBody.innerHTML = `<tr><td colspan="6" class="has-text-centered has-text-danger">
                Error al cargar los proyectos
            </td></tr>`;
        }
    }

// === MOSTRAR SOLICITUDES EN LA TABLA ===
function mostrarSolicitudes(lista) {
    tableBody.innerHTML = "";

    if (!lista.length) {
        tableBody.innerHTML = `<tr><td colspan="6" class="has-text-centered">No hay resultados</td></tr>`;
        return;
    }

    const hoy = new Date();

    lista.forEach(item => {
        const fecha = new Date(item.sca_fecha_creacion);
        const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

        const tr = document.createElement("tr");

        // Obtener nombre del estado desde el mapa
        const estadoNombre = estadosMap[item.estado] || "DESCONOCIDO";

        // Determinar color según el estado
        let color = "";
        switch (estadoNombre.toUpperCase()) {
            case "INGRESADA":
                color = "#555555"; // gris oscuro
                break;
            case "ACEPTADA":
            case "PROCESO":
                color = "#fbc74a"; // amarillo
                break;
            case "COMPLETA":
                color = "#00bf63"; // verde
                break;
            case "ANULADO":
                color = "#ff5757"; // rojo
                break;
            default:
                color = "#dddddd"; // gris claro por defecto
        }

        // Crear el span tipo tag
        const estadoTag = `<span style="
            display: inline-block;
            padding: 0.25em 0.75em;
            border-radius: 0.5rem;
            background-color: ${color};
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
        ">${estadoNombre}</span>`;

        // Construir fila
        tr.innerHTML = `
            <td>${item.sca_id}</td>
            <td>${item.sca_titulo}</td>
            <td>${fecha.toLocaleDateString()}</td>
            <td>${diffDias} días</td>
            <td>${estadoTag}</td>
            <td>
                <a href="/projects/${item.sca_id}/edit/" class="button is-small" 
                   style="background-color: #00b0ff; color: white; border: 2px solid #00b0ff;">
                    <span class="icon"><i class="fas fa-edit" style="color: white;"></i></span>
                </a>
                <a href="/projects/${item.sca_id}/info/" class="button is-small" 
                   style="background-color: #fbc74a; color: white; border: 2px solid #fbc74a;">
                    <span class="icon"><i class="fas fa-info-circle" style="color: white;"></i></span>
                </a>
                <button class="button is-small btn-anular" 
                        style="background-color: #ff5757; color: white; border: 2px solid #ff5757;" 
                        data-id="${item.sca_id}" 
                        title="Anular solicitud">
                    <span class="icon">
                        <i class="fas fa-trash" style="color: white;"></i>
                    </span>
                </button>
            </td>
        `;

        tableBody.appendChild(tr);
    });

    // === MANEJAR ANULAR SOLICITUD ===
    document.querySelectorAll(".btn-anular").forEach(btn => {
        
        btn.addEventListener("click", async () => {
            const solicitudId = btn.dataset.id;
            const token = localStorage.getItem("token");
            if (!confirm("¿Estás seguro de que deseas anular esta solicitud?")) return;

            try {
                const response = await fetch("http://127.0.0.1:8000/solicitudes/anular/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
                    },
                    body: JSON.stringify({ solicitud_id: solicitudId })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Error al anular la solicitud");
                }

                alert(result.mensaje || "Solicitud anulada correctamente");
                aplicarFiltros(); // recarga el listado
            } catch (error) {
                console.error("Error al anular solicitud:", error);
                alert("No se pudo anular la solicitud");
            }
        });
    });
}

    // === APLICAR FILTROS ===
    async function aplicarFiltros() {
        const filtros = {};
        const estado = statusSelect.value;
        const fecha = dateInput.value;

        if (estado) filtros.estado_id = parseInt(estado);
        if (fecha) {
            const [year, month, day] = fecha.split("-");
            filtros.year = parseInt(year);
            filtros.month = parseInt(month);
            filtros.day = parseInt(day);
        }

        await cargarSolicitudes(filtros);
    }

    // === FILTRO LOCAL POR TEXTO ===
    searchInput.addEventListener("keyup", function () {
        const filtro = this.value.toLowerCase();
        const filas = tableBody.getElementsByTagName("tr");

        for (let fila of filas) {
            const textoFila = fila.textContent.toLowerCase();
            fila.style.display = textoFila.includes(filtro) ? "" : "none";
        }
    });

    // === FILTROS DE FECHA Y ESTADO ===
    dateInput.addEventListener("change", aplicarFiltros);
    statusSelect.addEventListener("change", aplicarFiltros);

    // === CARGA INICIAL ===
    await cargarEstados();
    await cargarSolicitudes();
});
