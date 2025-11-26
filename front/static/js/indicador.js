document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const baseUrl = "http://127.0.0.1:8000";

    // === utilidades ===
    function diasDesde(fechaStr) {
        if (!fechaStr) return null;
        const hoy = new Date();
        const f = new Date(fechaStr);
        const diff = hoy - f;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    function monthKey(fechaStr) {
        if (!fechaStr) return null;
        const d = new Date(fechaStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    // === fetch solicitudes ===
    async function fetchSolicitudes() {
        try {
            const res = await fetch(`${baseUrl}/solicitudes/filtrar/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({})
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("Error al cargar solicitudes:", err);
            return [];
        }
    }

    // === fetch bitácoras ===
    async function fetchBitacorasPorSolicitud(solicitud_id) {
        try {
            const res = await fetch(`${baseUrl}/solicitudes/bitacora/filtrar/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({ solicitud_id })
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.error("Error al cargar bitácoras:", err);
            return [];
        }
    }

    async function mapWithConcurrency(items, fn, concurrency = 6) {
        const results = [];
        let i = 0;
        const workers = Array.from({ length: concurrency }, async () => {
            while (true) {
                const idx = i++;
                if (idx >= items.length) break;
                try { results[idx] = await fn(items[idx], idx); }
                catch (e) { results[idx] = null; }
            }
        });
        await Promise.all(workers);
        return results;
    }

    // === obtener solicitudes ===
    const solicitudes = await fetchSolicitudes();

    // === normalizar ===
    let norm = solicitudes.map(s => ({
        sca_id: s.sca_id ?? s.id ?? null,
        sca_titulo: s.sca_titulo ?? s.titulo ?? "(sin título)",
        sca_fecha_creacion: s.sca_fecha_creacion ?? s.fecha ?? null,
        estado: Number(s.estado ?? s.est_id ?? s.est_id_id ?? 0),
        raw: s
    }));

    // ===  QUITAR ANULADAS (estado 5) ===
    norm = norm.filter(s => s.estado !== 5);

    // =====================================================
    // === Indicador 1: EMBUDO (sin anuladas)
    // =====================================================
    const estadoLabelsMap = { 1: "INGRESADA", 2: "ACEPTADA", 3: "PROCESO", 4: "COMPLETA" };
    const estadoOrder = [1, 2, 3, 4];
    const countsEstado = estadoOrder.map(id => norm.filter(x => x.estado === id).length);

    (function renderEmbudo() {
        const ctx = document.getElementById("graficoEmbudo");
        if (!ctx) return;
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: estadoOrder.map(id => estadoLabelsMap[id]),
                datasets: [{
                    label: "Cantidad",
                    data: countsEstado,
                    backgroundColor: ["#0091dd", "#fbc74a", "#f7941d", "#00bf63"]
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: { titleColor: "white", bodyColor: "white" }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.2)" } },
                    y: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.2)" } }
                }
            }
        });
    })();

    // =====================================================
    // === Indicador 2: SLA (>120 y 60-120) con spans ===
    // =====================================================
    const mas120 = [], entre60y120 = [];
    norm.forEach(s => {
        if (s.estado === 4) return;
        const dias = diasDesde(s.sca_fecha_creacion);
        if (dias === null) return;
        if (dias > 120) mas120.push({ ...s, dias });
        else if (dias >= 60) entre60y120.push({ ...s, dias });
    });

    mas120.sort((a, b) => b.dias - a.dias);
    entre60y120.sort((a, b) => b.dias - a.dias);

    function fillSLAList(selector, items, colorClass) {
        const ul = document.getElementById(selector);
        if (!ul) return;
        ul.innerHTML = "";
        if (!items.length) {
            const li = document.createElement("li");
            li.textContent = "No hay resultados";
            ul.appendChild(li);
            return;
        }
        items.forEach(it => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="${colorClass}">ID: ${it.sca_id} - ${it.dias} días</span>`;
            ul.appendChild(li);
        });
    }

    fillSLAList("listaMas120", mas120, "sla-rojo");
    fillSLAList("lista60a120", entre60y120, "sla-naranja");

    // =====================================================
    // === Indicador 3: SIN COMENTARIOS 20 DÍAS ===
    // =====================================================
    const pendientes = norm.filter(s => s.estado !== 4);
    const bitacorasSummary = await mapWithConcurrency(pendientes, async (s) => {
        const arr = await fetchBitacorasPorSolicitud(s.sca_id);
        if (!Array.isArray(arr)) return { sca_id: s.sca_id, last: null };
        let last = null;
        for (const b of arr) {
            if (!b.fecha_creacion) continue;
            const d = new Date(b.fecha_creacion);
            if (!last || d > last) last = d;
        }
        return { sca_id: s.sca_id, last: last ? last.toISOString() : null };
    });

    const sinComentarios20 = [];
    const diasUmbral = 20;
    for (const summary of bitacorasSummary) {
        const s = pendientes.find(x => x.sca_id === summary.sca_id);
        if (!s) continue;
        let diasDesdeUltimo = summary.last ? diasDesde(summary.last) : diasDesde(s.sca_fecha_creacion);
        if (diasDesdeUltimo >= diasUmbral) {
            sinComentarios20.push({ sca_id: s.sca_id, dias: diasDesdeUltimo });
        }
    }
    sinComentarios20.sort((a, b) => b.dias - a.dias);

    const ulSinCom = document.getElementById("listaSinComentarios20");
    if (ulSinCom) {
        ulSinCom.innerHTML = "";
        if (!sinComentarios20.length) {
            const li = document.createElement("li");
            li.textContent = "No hay solicitudes sin comentarios en 20 días";
            ulSinCom.appendChild(li);
        } else {
            sinComentarios20.forEach(it => {
                const li = document.createElement("li");
                li.innerHTML = `<span class="sla-naranja">ID: ${it.sca_id} - ${it.dias} días</span>`;
                ulSinCom.appendChild(li);
            });
        }
    }

    // =====================================================
    // === Indicador 4: Promedio COMPLETADAS (sin anuladas) ===
    // =====================================================
    const completadas = norm.filter(s => s.estado === 4);
    const diasCompletadas = completadas.map(s => diasDesde(s.sca_fecha_creacion)).filter(d => d !== null && !isNaN(d));
    const promedio = diasCompletadas.length ? Math.round(diasCompletadas.reduce((a, b) => a + b, 0) / diasCompletadas.length) : null;
    const promedioEl = document.getElementById("promedioCompletadas");
    if (promedioEl) promedioEl.textContent = promedio ? `${promedio} días` : "No hay completadas";

    // =====================================================
    // === Indicador 5: Solicitudes por mes ===
    // =====================================================
    const mesesCount = {};
    norm.forEach(s => {
        const mk = monthKey(s.sca_fecha_creacion);
        if (!mk) return;
        mesesCount[mk] = (mesesCount[mk] || 0) + 1;
    });
    const mesesOrden = [];
    for (let m = 1; m <= 12; m++) mesesOrden.push(`2025-${String(m).padStart(2, "0")}`);
    const dataMeses = mesesOrden.map(k => mesesCount[k] || 0);

    (function renderMeses() {
        const ctx = document.getElementById("graficoMeses");
        if (!ctx) return;
        new Chart(ctx, {
            type: "line",
            data: {
                labels: mesesOrden,
                datasets: [{
                    label: "PROYECTOS",
                    data: dataMeses,
                    tension: 0.2,
                    fill: true,
                    backgroundColor: "rgba(0,145,221,0.08)",
                    borderColor: "#0091dd",
                    pointRadius: 4,
                    pointBackgroundColor: "#0091dd"
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: "white" } },
                    tooltip: { titleColor: "white", bodyColor: "white" }
                },
                scales: {
                    x: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.2)" } },
                    y: { beginAtZero: true, ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.2)" } }
                }
            }
        });
    })();
});
