# Diagnostico de fallas en dispositivos moviles

Aplicacion web sencilla que captura sintomas de un dispositivo movil, genera un vector normalizado y lo envia al servicio para recibir recomendaciones de reparacion.

## Caracteristicas

- Formulario de captura con deslizadores y preguntas Si/No preconfiguradas a valores numericos.
- Mapeo automatico de sintomas a los pesos solicitados (0.0 a 1.0) antes de llamar al API.
- Persistencia en `localStorage` para mostrar la ultima respuesta en la pantalla de resultados.
- Interfaz adaptada a pantallas pequenas mediante CSS responsivo.

## Estructura del proyecto

```
.
├── index.html          # Formulario principal de diagnostico
├── results.html        # Vista de resultados y sugerencias
├── css
│   └── styles.css      # Estilos de la aplicacion
└── js
    └── main.js        # Logica de captura, mapeo y consumo del API
```

## Ejecucion local

1. Instala dependencias de desarrollo opcionales (por ejemplo `serve`) si aun no las tienes:
   ```bash
   npm install --global serve
   ```
2. Desde la carpeta del proyecto, levanta un servidor estatico:
   ```bash
   serve .
   ```
3. Abre `http://localhost:3000/index.html` en tu navegador y completa el formulario.

> **Nota sobre CORS:** el backend debe permitir el origen que uses en local (`http://localhost:3000`, `http://127.0.0.1:3000`, etc.). Si ves errores de "Access-Control-Allow-Origin", configura CORS en el servidor o utiliza un proxy.

## Desarrollo

- Los valores numericos que se envian al API se definen en `js/main.js` dentro de `SYMPTOM_SCHEMA`.
- La vista de resultados reutiliza los datos guardados en `localStorage`. Si deseas limpiar la informacion, borra la clave `diagnostic:lastResult:v2` desde la consola del navegador.
- Para depurar nuevas llamadas al API, puedes agregar `console.log(payload)` antes de `fetch` y retirarlo al terminar.
