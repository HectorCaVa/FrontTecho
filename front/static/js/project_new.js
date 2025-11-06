document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página");
        window.location.href = "/login/";
        return;
    }

    const estadoSelect = document.querySelector("select[name='status']");
    const projectForm = document.querySelector("form");
    const projectFilesInput = document.getElementById("projectFiles");
    const filesTableBody = document.querySelector("#filesTable tbody");

    // === 1. Cargar estados desde el backend ===
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

            if (!response.ok) throw new Error("Error al cargar los estados");

            const data = await response.json();
            const estados = data.estados || [];

            estadoSelect.innerHTML = `<option value="">Seleccione estado</option>`;
            estados.forEach(estado => {
                const option = document.createElement("option");
                option.value = estado.estado_id;
                option.textContent = estado.estado_nombre;
                estadoSelect.appendChild(option);
            });

        } catch (err) {
            console.error(err);
            estadoSelect.innerHTML = `<option value="">Error al cargar estados</option>`;
        }
    }

    await cargarEstados();

    // === 2. Manejo de tabla de archivos ===
    projectFilesInput.addEventListener("change", function (event) {
        const files = Array.from(event.target.files);
        filesTableBody.innerHTML = "";

        files.forEach((file, index) => {
            const tr = document.createElement("tr");

            const nameTd = document.createElement("td");
            nameTd.textContent = file.name;
            tr.appendChild(nameTd);

            const actionsTd = document.createElement("td");

            const viewBtn = document.createElement("button");
            viewBtn.type = "button";
            viewBtn.className = "button is-small is-info mr-2";
            viewBtn.textContent = "Ver";
            viewBtn.onclick = () => window.open(URL.createObjectURL(file), "_blank");
            actionsTd.appendChild(viewBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "button is-small is-danger";
            deleteBtn.textContent = "Eliminar";
            deleteBtn.onclick = () => tr.remove();
            actionsTd.appendChild(deleteBtn);

            tr.appendChild(actionsTd);
            filesTableBody.appendChild(tr);
        });
    });

    // === 3. Envío del formulario a la API ===
    projectForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("sca_titulo", projectForm.name.value);
        formData.append("sca_descripcion", projectForm.description.value);
        formData.append("est_id", estadoSelect.value);
        formData.append("sca_rut", projectForm.rut.value);
        formData.append("sca_email", projectForm.email.value);
        formData.append("sca_telefono", projectForm.phone.value);
        formData.append("sca_fecha_creacion", projectForm.date.value);

        const files = Array.from(projectFilesInput.files);
        files.forEach(file => formData.append("documentos_data", file));

        try {
            const response = await fetch("http://127.0.0.1:8000/solicitudes/crear/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.mensaje || "Proyecto creado correctamente");
                window.location.href = "/projects/";
            } else {
                console.error(data);
                alert(data.error || "Ocurrió un error al crear el proyecto");
            }

        } catch (err) {
            console.error(err);
            alert("Error al conectar con el servidor");
        }
    });
});
