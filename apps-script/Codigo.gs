// Parrilla Candela Viva — guarda la parrilla en esta hoja de Google.
// Una fila por nota. La página web lee y escribe a través de este script.

const HOJA_ID = '14bWvaR7OSBu2JC66DbQBPBZB-_2msj3zzksmq78sjs4'; // hoja «Parrilla Candela Viva»
const HOJA = 'Parrilla';
const COLS = ['Semana', 'Día', 'Orden', 'Nota', 'Planillada', 'ID', 'Actualizado'];
const DIAS = ['lun', 'mar', 'mie', 'jue', 'vie'];
const NOMBRE = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes' };
const CLAVE = { 'Lunes': 'lun', 'Martes': 'mar', 'Miércoles': 'mie', 'Jueves': 'jue', 'Viernes': 'vie' };

function hoja_() {
  const ss = SpreadsheetApp.openById(HOJA_ID);
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    const primera = ss.getSheets()[0];
    sh = primera.getLastRow() === 0 ? primera.setName(HOJA) : ss.insertSheet(HOJA);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight('bold');
  }
  sh.getRange('A:G').setNumberFormat('@'); // todo como texto (evita que la hoja convierta fechas)
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function semanaValida_(w) {
  if (typeof w !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(w)) return false;
  const d = new Date(w + 'T12:00:00Z');
  return !isNaN(d) && d.getUTCDay() === 1;
}

function filas_() {
  const sh = hoja_();
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, COLS.length).getDisplayValues();
}

function vacia_() { return { lun: [], mar: [], mie: [], jue: [], vie: [] }; }

// GET ?accion=semana&w=AAAA-MM-DD  |  ?accion=semanas  |  ?accion=salud
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const accion = p.accion || 'salud';

    if (accion === 'salud') {
      return json_({ servidor: 'ok', hoja: SpreadsheetApp.openById(HOJA_ID).getName(), filas: Math.max(0, hoja_().getLastRow() - 1) });
    }

    if (accion === 'semana') {
      const w = p.w;
      if (!semanaValida_(w)) return json_({ error: 'Semana inválida' });
      const notas = vacia_();
      let updatedAt = null;
      filas_().filter(r => r[0] === w).forEach(r => {
        const d = CLAVE[r[1]];
        if (!d) return;
        notas[d].push({ orden: Number(r[2]) || 0, id: r[5] || Utilities.getUuid().slice(0, 8), title: r[3], done: r[4] === 'Sí' });
        if (r[6] && (!updatedAt || r[6] > updatedAt)) updatedAt = r[6];
      });
      DIAS.forEach(d => {
        notas[d].sort((a, b) => a.orden - b.orden);
        notas[d] = notas[d].map(n => ({ id: n.id, title: n.title, done: n.done }));
      });
      return json_({ w: w, notas: notas, updatedAt: updatedAt });
    }

    if (accion === 'semanas') {
      const res = {};
      filas_().forEach(r => {
        if (!r[0]) return;
        const s = res[r[0]] || (res[r[0]] = { w: r[0], total: 0, hechas: 0 });
        s.total++;
        if (r[4] === 'Sí') s.hechas++;
      });
      const semanas = Object.keys(res).sort().reverse().map(k => res[k]);
      return json_({ semanas: semanas });
    }

    return json_({ error: 'Acción desconocida' });
  } catch (err) {
    return json_({ error: 'Error en la hoja: ' + err.message });
  }
}

// POST {w, notas}: reemplaza la parrilla de esa semana en la hoja
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const w = body.w;
    if (!semanaValida_(w)) return json_({ error: 'Semana inválida' });
    const ahora = new Date().toISOString();

    const nuevas = [];
    DIAS.forEach(d => {
      const lista = (body.notas && Array.isArray(body.notas[d])) ? body.notas[d].slice(0, 200) : [];
      lista.filter(n => n && typeof n.title === 'string' && n.title.trim()).forEach((n, i) => {
        nuevas.push([w, NOMBRE[d], i + 1, n.title.trim().slice(0, 400), n.done ? 'Sí' : 'No', String(n.id || '').slice(0, 40), ahora]);
      });
    });

    const sh = hoja_();
    const otras = filas_().filter(r => r[0] !== w);
    const todas = otras.concat(nuevas);
    const orden = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5 };
    todas.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0) || (orden[a[1]] - orden[b[1]]) || (Number(a[2]) - Number(b[2])));

    const n = sh.getLastRow();
    if (n > 1) sh.getRange(2, 1, n - 1, COLS.length).clearContent();
    if (todas.length) sh.getRange(2, 1, todas.length, COLS.length).setValues(todas);

    return json_({ ok: true, w: w, updatedAt: ahora });
  } catch (err) {
    return json_({ error: 'Error guardando en la hoja: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}
