document.addEventListener("DOMContentLoaded", () => {
    // Leer token desde localStorage
    const token = localStorage.getItem("token");
    

    fetch("http://127.0.0.1:8000/solicitudes/filtrar/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Token ${token}` } : {})
        },
        body: JSON.stringify({})
    })
    .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
    })
    .then(data => {
        // Inicializamos conteos
        let conteos = {
            ingresada: 0,
            aceptada: 0,
            proceso: 0,
            completa: 0,
            anulado: 0
        };

        data.forEach(solicitud => {
            let estadoId;

            // Detecta si estado es número o un objeto con est_id
            if (typeof solicitud.estado === "number") {
                estadoId = solicitud.estado;
            } else if (solicitud.estado && solicitud.estado.est_id) {
                estadoId = solicitud.estado.est_id;
            } else {
                console.warn("Estado desconocido:", solicitud.estado);
                return; // saltar si no se reconoce
            }

            // Contar según ID
            switch(estadoId){
                case 1: conteos.ingresada++; break;
                case 2: conteos.aceptada++; break;
                case 3: conteos.proceso++; break;
                case 4: conteos.completa++; break;
                case 5: conteos.anulado++; break;
                default: console.warn("ID de estado no esperado:", estadoId);
            }
        });

        // Total
        const total = Object.values(conteos).reduce((a,b) => a+b, 0);

        // Actualizar HTML
        document.querySelector("#total").textContent = total;
        document.querySelector("#ingresada").textContent = conteos.ingresada;
        document.querySelector("#aceptada").textContent = conteos.aceptada;
        document.querySelector("#proceso").textContent = conteos.proceso;
        document.querySelector("#completa").textContent = conteos.completa;
        document.querySelector("#anulado").textContent = conteos.anulado;
    })
    .catch(err => console.error("Error cargando resumen:", err));
});
