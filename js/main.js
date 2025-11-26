const API_ENDPOINT = "http://132.196.250.98:3000/diagnostico/general";
const STORAGE_KEY = "diagnostic:lastResult:v2";

const DEFAULT_OPTION = { display: "Sin respuesta", weight: 0 };

const SYMPTOM_SCHEMA = [
    {
        name: "bateria",
        label: "Duración de batería",
        valueMap: {
            "0": { display: "Sin problema", weight: 0 },
            "25": { display: "Se reduce cerca de 25%", weight: 0.25 },
            "50": { display: "Se reduce cerca de 50%", weight: 0.5 },
            "75": { display: "Dura cerca del 25%", weight: 0.75 },
            "100": { display: "No retiene carga", weight: 1 }
        }
    },
    {
        name: "carga",
        label: "Velocidad de carga",
        valueMap: {
            "0": { display: "Normal", weight: 0 },
            "1": { display: "Lenta", weight: 0.3 },
            "2": { display: "Muy lenta", weight: 0.6 },
            "3": { display: "No carga", weight: 1 }
        }
    },
    {
        name: "bluetooth",
        label: "Comportamiento del Bluetooth",
        valueMap: {
            "0": { display: "Funciona correctamente", weight: 0 },
            "1": { display: "No encuentra dispositivos", weight: 0.3 },
            "2": { display: "No enciende", weight: 1 },
            "3": { display: "No conecta", weight: 0.8 }
        }
    },
    {
        name: "anuncios",
        label: "Anuncios inesperados",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.8 }
        }
    },
    {
        name: "datos",
        label: "Consumo de datos inesperado",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.6 }
        }
    },
    {
        name: "pantalla",
        label: "Manchas o parpadeos en pantalla",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.5 }
        }
    },
    {
        name: "touch",
        label: "Touch no responde",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.9 }
        }
    },
    {
        name: "fantasma",
        label: "Frecuencia de toques fantasma",
        valueMap: {
            "0": { display: "No aparecen", weight: 0 },
            "1": { display: "Pocas veces", weight: 0.3 },
            "2": { display: "A veces", weight: 0.6 },
            "3": { display: "Muy seguido", weight: 0.9 }
        }
    },
    {
        name: "bocinas",
        label: "Distorsión en bocinas",
        valueMap: {
            "0": { display: "No hay distorsión", weight: 0 },
            "1": { display: "Leve", weight: 0.3 },
            "2": { display: "Moderada", weight: 0.6 },
            "3": { display: "Alta", weight: 0.9 }
        }
    },
    {
        name: "microfono",
        label: "Fallas en el micrófono",
        valueMap: {
            "0": { display: "No hay fallas", weight: 0 },
            "1": { display: "Leve", weight: 0.4 },
            "2": { display: "Moderada", weight: 0.7 },
            "3": { display: "Alta", weight: 1 }
        }
    },
    {
        name: "proximidad",
        label: "Falla en el sensor de proximidad",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.8 }
        }
    },
    {
        name: "camara",
        label: "Respuesta de la cámara",
        valueMap: {
            "0": { display: "Abre sin problema", weight: 0 },
            "1": { display: "Abre con manchas", weight: 0.5 },
            "2": { display: "No abre", weight: 1 }
        }
    },
    {
        name: "almacenamiento",
        label: "Poco almacenamiento",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.2 }
        }
    },
    {
        name: "reinicios",
        label: "Reinicios inesperados",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.8 }
        }
    },
    {
        name: "senial",
        label: "Pérdida de señal o Wi-Fi",
        valueMap: {
            no: { display: "No", weight: 0 },
            si: { display: "Sí", weight: 0.1 }
        }
    }
];

const diagnosticForm = document.querySelector("form.diagnostic-card");

if (diagnosticForm) {
    diagnosticForm.addEventListener("submit", handleDiagnosticSubmit);
}

const resultsContainer = document.getElementById("result-diagnosis");

if (resultsContainer) {
    hydrateResultsView();
}

async function handleDiagnosticSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector("[type='submit']");
    const formData = new FormData(form);

    const evaluation = buildEvaluation(formData);
    const payload = evaluation.map((item) => item.weight);

    const submission = {
        timestamp: new Date().toISOString(),
        evaluation,
        payload
    };

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalLabel = submitButton.textContent ?? "";
        submitButton.textContent = "Diagnosticando...";
    }

    const apiResult = await dispatchDiagnostic(payload);
    submission.api = apiResult;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    } catch (error) {
        console.error("No fue posible guardar el resultado:", error);
    }

    if (submitButton) {
        submitButton.disabled = false;
        const original = submitButton.dataset.originalLabel ?? "Diagnosticar";
        submitButton.textContent = original;
        delete submitButton.dataset.originalLabel;
    }

    const target = form.getAttribute("action") || "results.html";
    window.location.assign(target);
}

function buildEvaluation(formData) {
    return SYMPTOM_SCHEMA.map((item, index) => {
        const rawValue = formData.get(item.name);
        const key = rawValue !== null ? String(rawValue) : undefined;
        const resolved = (key && item.valueMap[key]) || DEFAULT_OPTION;

        return {
            index,
            name: item.name,
            label: item.label,
            value: key ?? null,
            display: resolved.display,
            weight: resolved.weight
        };
    });
}

async function dispatchDiagnostic(payload) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sintomas: payload })
        });

        const data = await safeParseJson(response);
        return {
            ok: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            ok: false,
            status: null,
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}

async function safeParseJson(response) {
    const rawText = await response.text();
    if (!rawText) {
        return null;
    }

    try {
        return JSON.parse(rawText);
    } catch (error) {
        console.warn("La respuesta del servicio no es JSON válido:", error);
        return rawText;
    }
}

function hydrateResultsView() {
    const diagnosisContainer = document.getElementById("result-diagnosis");

    if (!diagnosisContainer) {
        return;
    }

    const storedRaw = localStorage.getItem(STORAGE_KEY);

    if (!storedRaw) {
        diagnosisContainer.innerHTML = "";
        diagnosisContainer.append(createParagraph("Captura síntomas para generar recomendaciones."));
        return;
    }

    let stored;
    try {
        stored = JSON.parse(storedRaw);
    } catch (error) {
        console.error("No fue posible interpretar los datos almacenados:", error);
        diagnosisContainer.innerHTML = "";
        diagnosisContainer.append(createParagraph("Intenta capturar de nuevo para regenerar el diagnóstico."));
        return;
    }

    const { api } = stored;
    renderDiagnosis(diagnosisContainer, api?.data);
}

function renderDiagnosis(container, diagnosis) {
    container.innerHTML = "";

    if (!Array.isArray(diagnosis) || diagnosis.length === 0) {
        container.innerHTML = "";
        container.append(createParagraph("El servicio no devolvió sugerencias para los síntomas enviados."));
        return;
    }

    diagnosis.forEach((item) => {
        const card = document.createElement("article");
        card.className = "results-diagnosis__item";

        const header = document.createElement("div");
        header.className = "results-diagnosis__header";

        const title = document.createElement("h3");
        title.className = "results-diagnosis__title";
        title.textContent = item.falla ?? "Falla sin nombre";

        const grade = document.createElement("span");
        grade.className = "results-diagnosis__grade";
        if (typeof item.gradoNormalizado === "number") {
            grade.textContent = `Grado normalizado: ${item.gradoNormalizado.toFixed(2)}`;
        }

        header.append(title);
        if (grade.textContent) {
            header.append(grade);
        }

        card.append(header);

        if (item.origen) {
            card.append(createSection("Posible origen", item.origen));
        }

        if (item.solucion) {
            card.append(createSection("Solución sugerida", item.solucion));
        }

        if (Array.isArray(item.recomendaciones) && item.recomendaciones.length > 0) {
            const wrapper = document.createElement("div");
            wrapper.className = "results-diagnosis__section";

            const heading = document.createElement("span");
            heading.textContent = "Recomendaciones";
            wrapper.append(heading);

            const list = document.createElement("ul");
            list.className = "results-diagnosis__recommendations";

            item.recomendaciones.forEach((tip) => {
                const li = document.createElement("li");
                li.textContent = tip;
                list.append(li);
            });

            wrapper.append(list);
            card.append(wrapper);
        }

        container.append(card);
    });
}

function createSection(title, content) {
    const section = document.createElement("div");
    section.className = "results-diagnosis__section";

    const heading = document.createElement("span");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = content;

    section.append(heading, paragraph);
    return section;
}

function createParagraph(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
}
