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

            statusSelect.innerHTML = `<option value="">Todos los estados</option>`;

            estados.forEach(estado => {
                estadosMap[estado.estado_id] = estado.estado_nombre;

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

            const estadoNombre = estadosMap[item.estado] || "DESCONOCIDO";

            // === COLOR DEL ESTADO ===
            let color = "";
            switch (estadoNombre.toUpperCase()) {
                case "INGRESADA":
                    color = "#555555"; break;
                case "ACEPTADA":
                case "PROCESO":
                    color = "#fbc74a"; break;
                case "COMPLETA":
                    color = "#00bf63"; break;
                case "ANULADO":
                    color = "#ff5757"; break;
                default:
                    color = "#dddddd";
            }

            // === COLOR SEGÚN DÍAS ===
            let diasColor = "";
            if (diffDias <= 60) {
                diasColor = "#00bf63"; // verde
            } else if (diffDias <= 89) {
                diasColor = "#fbc74a"; // naranjo
            } else {
                diasColor = "#ff5757"; // rojo
            }

            // Tag de estado
            const estadoTag = `<span style="
                display: inline-block;
                padding: 0.25em 0.75em;
                border-radius: 0.5rem;
                background-color: ${color};
                color: white;
                font-weight: bold;
                font-size: 0.9rem;
            ">${estadoNombre}</span>`;

            // === FILA ===
            tr.innerHTML = `
                <td>${item.sca_id}</td>
                <td>${item.sca_titulo}</td>
                <td>${fecha.toLocaleDateString()}</td>

                <td>
                    <span style="padding:4px 8px; border-radius:6px; color:white; background-color:${diasColor}">
                        ${diffDias} días
                    </span>
                </td>

                <td>${estadoTag}</td>

                <td>
                    <a href="/projects/${item.sca_id}/edit/" class="button is-small" 
                       style="background-color:#00b0ff; color:white; border:2px solid #00b0ff;">
                        <span class="icon"><i class="fas fa-edit" style="color:white;"></i></span>
                    </a>

                    <a href="/projects/${item.sca_id}/info/" class="button is-small" 
                       style="background-color:#fbc74a; color:white; border:2px solid #fbc74a;">
                        <span class="icon"><i class="fas fa-info-circle" style="color:white;"></i></span>
                    </a>

                    <button class="button is-small btn-anular" 
                            style="background-color:#ff5757; color:white; border:2px solid #ff5757;"
                            data-id="${item.sca_id}"
                            title="Anular solicitud">
                        <span class="icon"><i class="fas fa-trash" style="color:white;"></i></span>
                    </button>
                </td>
            `;

            tableBody.appendChild(tr);
        });

        // === MANEJAR ANULAR ===
        document.querySelectorAll(".btn-anular").forEach(btn => {
            btn.addEventListener("click", async () => {
                const solicitudId = btn.dataset.id;

                if (!confirm("¿Estás seguro de anular esta solicitud?")) return;

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

                    if (!response.ok) throw new Error(result.error);

                    alert(result.mensaje || "Solicitud anulada correctamente");
                    aplicarFiltros();

                } catch (error) {
                    console.error("Error al anular:", error);
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

    // === FILTRO LOCAL POR BUSCADOR ===
    searchInput.addEventListener("keyup", function () {
        const filtro = this.value.toLowerCase();
        const filas = tableBody.getElementsByTagName("tr");

        for (let fila of filas) {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(filtro) ? "" : "none";
        }
    });

    dateInput.addEventListener("change", aplicarFiltros);
    statusSelect.addEventListener("change", aplicarFiltros);

    await cargarEstados();
    await cargarSolicitudes();
});
