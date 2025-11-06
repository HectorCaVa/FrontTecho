document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const solicitudId = pathParts[2];
    if (!solicitudId) return alert("No se encontró la solicitud");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "/login/";
        return;
    }

    //Bloquear todos los campos excepto los botones
    const form = document.getElementById("projectEditForm");
    const elements = form.querySelectorAll("input, select, textarea");

    elements.forEach(el => {
        el.setAttribute("readonly", true);
        el.classList.add("is-static"); // estilo visual opcional de Bulma
        el.disabled = true; // asegura que no se puedan editar ni enfocar
    });

    const filesTableBody = document.querySelector("#filesTable tbody");
    const bitacorasTableBody = document.querySelector("#bitacorasTable tbody");
    const statusSelect = document.getElementById("estadoSelect");

    let estadosDisponibles = [];

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
            estadosDisponibles = data.estados || [];

            // Limpiar y llenar select
            statusSelect.innerHTML = `<option value="">Seleccione un estado</option>`;
            estadosDisponibles.forEach(estado => {
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

    // === CARGAR SOLICITUD ===
    async function cargarSolicitud() {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/filtrar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error("Error al obtener las solicitudes");
            const data = await response.json();

            const solicitud = data.find(item => item.sca_id == solicitudId);
            if (!solicitud) return alert("No se encontró la solicitud");

            console.log("Solicitud cargada:", solicitud);

            // Guardar estado ID
            const estadoId = solicitud.estado;

            // === Cargar estados primero y luego seleccionar ===
            await cargarEstados();
            if (estadoId) statusSelect.value = estadoId;

            // Buscar nombre del estado para el timeline
            const estadoEncontrado = estadosDisponibles.find(e => e.estado_id == estadoId);
            
            const estadoNombre = estadoEncontrado ? estadoEncontrado.estado_nombre : "Desconocido";
            console.log(estadoNombre);
            // === Llenar campos ===
            document.getElementById("sca_titulo").value = solicitud.sca_titulo || "";
            document.getElementById("rut").value = solicitud.rut || "";
            document.getElementById("email").value = solicitud.solicitante_email || "";
            document.getElementById("phone").value = solicitud.phone || "";
            document.getElementById("date").value = solicitud.sca_fecha_creacion?.split("T")[0] || "";
            document.getElementById("estadoSelect").value = solicitud.estado;

            // === Llenar archivos ===
            filesTableBody.innerHTML = "";

            solicitud.documentos?.forEach(doc => {
                const tr = document.createElement("tr");
                const viewUrl = `http://127.0.0.1:8000/solicitudes/documento/${doc.doc_id}/`;
                tr.innerHTML = `
                    <td>${doc.doc_id}</td>
                    <td>
                        <button class="button is-small is-info mr-2" data-id="${doc.doc_id}" title="Ver documento">
                            <span class="icon has-text-white">
                                <i class="fas fa-download"></i>
                            </span>
                        </button>
                    </td>
                `;
                filesTableBody.appendChild(tr);

                // Asignar evento al botón
                const btn = tr.querySelector("button");
                btn.addEventListener("click", async () => {
                    const token = localStorage.getItem("token");
                    try {
                        const response = await fetch(viewUrl, {
                            headers: {
                                "Authorization": `Token ${token}`
                            }
                        });

                        if (!response.ok) {
                            throw new Error("Error al obtener el archivo");
                        }

                        // Convertir respuesta en blob y abrirla en nueva pestaña
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, "_blank");

                    } catch (err) {
                        alert("No se pudo mostrar el archivo");
                        console.error(err);
                    }
                });
            });

            // === Cargar bitácoras ===
            await cargarBitacoras(solicitud.sca_id);

            // === Renderizar timeline ===
            renderTimeline(estadoNombre);

        } catch (error) {
            console.error("Error al cargar la solicitud:", error);
            alert("No se pudo cargar la solicitud");
        }
    }

    // === CARGAR BITÁCORAS ===
    async function cargarBitacoras(solicitud_id) {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/bitacora/filtrar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({ solicitud_id })
            });

            if (!response.ok) throw new Error("Error al obtener las bitácoras");

            const bitacoras = await response.json();
            console.log("Bitácoras:", bitacoras);

            const bitacorasChat = document.getElementById("bitacorasChat");
            bitacorasChat.innerHTML = "";

            bitacoras.forEach(b => {
                const div = document.createElement("div");
                div.classList.add("bitacora-message");

                const header = document.createElement("div");
                header.classList.add("bitacora-header");
                header.textContent = `${b.fecha_creacion?.split("T")[0] || ""} - ${b.usuario_email}`;
                div.appendChild(header);

                const obs = document.createElement("div");
                obs.classList.add("bitacora-observacion");
                obs.textContent = b.observacion || "(sin observación)";
                div.appendChild(obs);

                if (b.documentos_adjuntos?.length) {
                    const docsDiv = document.createElement("div");
                    docsDiv.classList.add("bitacora-documentos");
                    b.documentos_adjuntos.forEach(doc => {
                        const a = document.createElement("a");
                        a.href = doc.url_archivo;
                        a.target = "_blank";
                        a.textContent = "Archivo";
                        docsDiv.appendChild(a);
                    });
                    div.appendChild(docsDiv);
                }

                bitacorasChat.appendChild(div);
            });

            bitacorasChat.scrollTop = bitacorasChat.scrollHeight;

        } catch (error) {
            console.error("Error al cargar bitácoras:", error);
            document.getElementById("bitacorasChat").innerHTML = `<div>No se pudieron cargar las bitácoras</div>`;
        }
    }

    function renderTimeline(estadoActual) {
    const estados = ["Ingresada", "Aceptada", "Proceso", "Completa"];
    const container = document.getElementById("projectTimeline");
    container.innerHTML = "";

    if (!estadoActual) estadoActual = "Ingresada";

    // 🔹 Convertimos todo a minúsculas para comparar sin importar el caso
    const estadoActualLower = estadoActual.toLowerCase();

    // Caso especial: si es "anulado"
    if (estadoActualLower === "anulado") {
        estados.forEach((estado, i) => {
            const step = document.createElement("div");
            step.classList.add("step", "anulado");
            step.innerHTML = `
                <div class="circle pulsing">${i + 1}</div>
                <div class="label">${estado}</div>
                <div class="connector red"></div>
            `;
            container.appendChild(step);
        });
        return;
    }

    estados.forEach((estado, i) => {
        const step = document.createElement("div");
        step.classList.add("step");

        // 🔹 Comparaciones en minúsculas
        const estadoLower = estado.toLowerCase();
        const indexActual = estados.findIndex(e => e.toLowerCase() === estadoActualLower);

        let circleClass = "";
        let connectorClass = "connector future";

        if (i < indexActual) {
            circleClass = "active";
            connectorClass = "connector completed";
        } else if (estadoLower === estadoActualLower) {
            circleClass = "active pulsing";
            connectorClass = "connector future";
        }

        step.innerHTML = `
            <div class="circle ${circleClass}"></div>
            <div class="label">${estado}</div>
            <div class="${connectorClass}"></div>
        `;

        container.appendChild(step);
    });
}

    // === Inicializar ===
    await cargarSolicitud();
});
