import { Redis } from '@upstash/redis';

// Vercel Marketplace (Upstash) crea KV_REST_API_URL / KV_REST_API_TOKEN.
// Una cuenta directa de Upstash usa UPSTASH_REDIS_REST_URL / _TOKEN. Se aceptan ambas.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
export const DAYS = ['lun', 'mar', 'mie', 'jue', 'vie'];
export const WEEKS_KEY = 'parrilla:semanas';
export const weekKey = (w) => `parrilla:semana:${w}`;

// Una semana se identifica por la fecha de su lunes: AAAA-MM-DD
export function validWeek(w) {
  if (typeof w !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(w)) return false;
  const d = new Date(w + 'T12:00:00Z');
  return !isNaN(d) && d.getUTCDay() === 1;
}

export function emptyWeek() {
  return { lun: [], mar: [], mie: [], jue: [], vie: [] };
}

// Limpia lo que llega del navegador antes de guardarlo
export function sanitize(notas) {
  const out = emptyWeek();
  if (!notas || typeof notas !== 'object') return out;
  for (const d of DAYS) {
    const list = Array.isArray(notas[d]) ? notas[d].slice(0, 200) : [];
    out[d] = list
      .filter((n) => n && typeof n.title === 'string' && n.title.trim())
      .map((n) => ({
        id: String(n.id || '').slice(0, 40) || Math.random().toString(36).slice(2),
        title: n.title.trim().slice(0, 400),
        done: !!n.done,
      }));
  }
  return out;
}

export function noDb(res) {
  res.status(500).json({ error: 'Base de datos no configurada. Conecta Upstash Redis al proyecto en Vercel.' });
}
