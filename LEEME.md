# Parrilla · Candela Viva

Web para programar la parrilla del en vivo (lunes a viernes). Guarda las notas en una base de datos y lleva un historial por semanas.

## Qué hay en esta carpeta

- `index.html`: la página (lo que ves en el navegador).
- `api/semana.js`: carga y guarda la parrilla de una semana.
- `api/semanas.js`: devuelve el historial de semanas guardadas.
- `api/_db.js`: conexión con la base de datos (Upstash Redis).
- `package.json`: la librería que usa el servidor.

## Publicarla en Vercel (con GitHub)

1. **Sube la carpeta a GitHub.** En github.com crea un repositorio nuevo, por ejemplo `parrilla-candela-viva`. Luego pulsa "uploading an existing file" y arrastra el contenido de esta carpeta (index.html, package.json, .gitignore, LEEME.md y la carpeta `api`). No subas `node_modules`.
2. **Importa el proyecto en Vercel.** En vercel.com entra con tu cuenta de GitHub. Pulsa **Add New… → Project**, elige el repositorio y pulsa **Deploy**. No hace falta configurar nada más: Vercel detecta el `index.html` y la carpeta `api`.
3. **Crea la base de datos.** Dentro del proyecto ve a la pestaña **Storage**. Pulsa **Create Database** (o busca en el Marketplace) y elige **Upstash → Redis** con el plan **Free**. Conéctala a tu proyecto, marcando los entornos Production y Preview. Vercel agrega solo las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **Vuelve a publicar.** En **Deployments**, abre el menú (⋯) del último despliegue y pulsa **Redeploy**, para que el proyecto tome las variables nuevas.
5. Abre la dirección `https://tu-proyecto.vercel.app`. Arriba a la derecha debe aparecer "Semana nueva" o "Guardado". Si dice "Sin conexión con la base de datos", repite los pasos 3 y 4.

Cada vez que cambies un archivo en GitHub, Vercel publica la nueva versión automáticamente.

## Cómo funciona

- **Guardado automático:** cada cambio (agregar, planillar, mover, quitar) se guarda solo, más o menos medio segundo después.
- **Semanas:** con las flechas pasas a la semana anterior o a la siguiente; "Esta semana" te regresa a la actual. Cada semana se guarda aparte y se identifica por la fecha de su lunes.
- **Historial:** muestra todas las semanas que tienen notas, con cuántas quedaron planilladas.
- **Acceso:** quien tenga el enlace puede ver y editar. No lo publiques en redes.
