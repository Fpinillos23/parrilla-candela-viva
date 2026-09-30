# Parrilla · Candela Viva

Página para programar la parrilla del en vivo (lunes a viernes). Las notas se guardan en una hoja de Google y queda un registro por semanas.

- Página: https://parrilla-candela-viva.vercel.app
- Hoja: «Parrilla Candela Viva» (Google Drive de torreinformativa17@gmail.com)
- Script: «Parrilla Candela Viva - API» (Apps Script, publicado como aplicación web con acceso para «Cualquier usuario»)

## Archivos

- `index.html`: la página completa. La dirección del script está en la línea `var API = '…/exec'`.
- `apps-script/Codigo.gs`: copia del código del script de Google, como respaldo.

## Cómo funciona

- Cada nota es una fila de la hoja: Semana (fecha del lunes), Día, Orden, Nota, Planillada (Sí/No), ID y Actualizado.
- La página lee con `?accion=semana&w=AAAA-MM-DD`, arma el historial con `?accion=semanas` y guarda la semana completa con un POST.
- Si la hoja no responde, la página guarda una copia en el navegador y la sube sola cuando vuelve la conexión.
- Para revisar la conexión, abre la dirección del script con `?accion=salud`.

## Si cambias el script

En Apps Script usa **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: nueva → Implementar**. Así la dirección `/exec` sigue siendo la misma y no hay que tocar `index.html`.
