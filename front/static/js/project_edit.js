document.addEventListener("DOMContentLoaded", async () => {
    // Extraer id de la URL
    const pathParts = window.location.pathname.split("/");
    const solicitudId = pathParts[2];
    if (!solicitudId) return alert("No se encontró la solicitud a editar");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "/login/";
        return;
    }

    const estadoSelect = document.getElementById("estadoSelect");
    const estadoActualInput = document.getElementById("estadoActual");
    const filesTableBody = document.querySelector("#filesTable tbody");
    const guardarBtn = document.getElementById("guardarBtn");

    let archivosExistentes = [];

// === Cargar solicitud ===
async function cargarSolicitud() {
    try {
        const response = await fetch("http://127.0.0.1:8000/solicitudes/filtrar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}` // Si usas JWT, cambia a Bearer
            },
            body: JSON.stringify({})
        });

        if (!response.ok) throw new Error("Error al obtener las solicitudes");

        const data = await response.json();
        const solicitud = data.find(item => item.sca_id == solicitudId);
        if (!solicitud) return alert("No se encontró la solicitud");

        // === Precargar inputs ===
        document.getElementById("solicitud_id").value = solicitud.sca_id || "";
        document.getElementById("sca_titulo").value = solicitud.sca_titulo || "";
        document.getElementById("sca_descripcion").value = solicitud.sca_descripcion || "";
        document.getElementById("rut").value = solicitud.rut || "";
        document.getElementById("email").value = solicitud.solicitante_email || "";
        document.getElementById("phone").value = solicitud.phone || "";
        document.getElementById("date").value = solicitud.sca_fecha_creacion?.split("T")[0] || "";
        document.getElementById("estadoActual").value = solicitud.estado;

        // === Llenar archivos ===
        filesTableBody.innerHTML = "";

        solicitud.documentos?.forEach(doc => {
            const tr = document.createElement("tr");
            const viewUrl = `http://127.0.0.1:8000/solicitudes/documento/${doc.doc_id}/`;
            const deleteUrl = `http://127.0.0.1:8000/solicitudes/documento/eliminar/`;

            tr.innerHTML = `
                <td>${doc.doc_id}</td>
                <td>
                    <button class="button is-small is-info mr-2 btn-ver" data-id="${doc.doc_id}" title="Ver documento">
                        <span class="icon has-text-white">
                            <i class="fas fa-download"></i>
                        </span>
                    </button>
                    <button class="button is-small is-danger mr-2 btn-eliminar" data-id="${doc.doc_id}" title="Eliminar documento">
                        <span class="icon has-text-white">
                            <i class="fa-solid fa-xmark"></i>
                        </span>
                    </button>
                </td>
            `;
            filesTableBody.appendChild(tr);

            // === Botón VER ===
            const btnVer = tr.querySelector(".btn-ver");
            btnVer.addEventListener("click", async () => {
                const token = localStorage.getItem("token");
                try {
                    const response = await fetch(viewUrl, {
                        headers: { "Authorization": `Token ${token}` }
                    });

                    if (!response.ok) throw new Error("Error al obtener el archivo");

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, "_blank");

                } catch (err) {
                    alert("No se pudo mostrar el archivo");
                    console.error(err);
                }
            });

            // === Botón ELIMINAR ===
            const btnEliminar = tr.querySelector(".btn-eliminar");
            btnEliminar.addEventListener("click", async () => {
                const token = localStorage.getItem("token");
                if (!confirm("¿Seguro que deseas eliminar este documento?")) return;

                try {
                    const response = await fetch(deleteUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Token ${token}`
                        },
                        body: JSON.stringify({ doc_id: doc.doc_id })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert("✅ Documento eliminado correctamente");
                        tr.remove();
                    } else {
                        alert(`⚠️ Error: ${data.error || data.detalle || "No se pudo eliminar el documento."}`);
                    }

                } catch (error) {
                    console.error("Error al eliminar documento:", error);
                    alert("Ocurrió un error al eliminar el documento.");
                }
            });
        });

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar la solicitud");
    }
}


    // === Cargar estados (solo para mostrar) ===
    async function cargarEstados() {
        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/estado/filtrar/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({})
            });
            if (!response.ok) throw new Error("Error al obtener los estados");

            const data = await response.json();
            const estados = data.estados || [];

            estadoSelect.innerHTML = "";
            estados.forEach(estado => {
                const option = document.createElement("option");
                option.value = estado.estado_id;
                option.textContent = estado.estado_nombre;
                estadoSelect.appendChild(option);
            });

            // Seleccionar estado actual
            const currentEstado = estadoActualInput.value;
            if (currentEstado) estadoSelect.value = currentEstado;

        } catch (error) {
            console.error("Error al cargar estados:", error);
            estadoSelect.innerHTML = `<option value="">Error al cargar</option>`;
        }
    }

    // === Guardar cambios ===
    guardarBtn.addEventListener("click", async () => {
        const formData = new FormData();
        formData.append("solicitud_id", document.getElementById("solicitud_id").value);
        formData.append("sca_titulo", document.getElementById("sca_titulo").value);
        formData.append("sca_descripcion", document.getElementById("sca_descripcion").value);
        formData.append("est_id", document.getElementById("estadoSelect").value);

        // Nuevos archivos
        const nuevosArchivos = Array.from(document.getElementById("projectFiles").files);
        nuevosArchivos.forEach(file => formData.append("nuevos_documentos", file));

        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/modificar/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Error al actualizar la solicitud");

            alert(data.mensaje);
            window.location.href = "/projects/";
        } catch (error) {
            console.error(error);
            alert("No se pudo actualizar la solicitud: " + (error.message || error));
        }
    });

    // Inicializar
    await cargarSolicitud();
    await cargarEstados();
});
