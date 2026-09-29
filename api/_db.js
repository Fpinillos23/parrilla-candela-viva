import { Redis } from '@upstash/redis';

// Busca las credenciales REST de Upstash en las variables de entorno.
// Vercel Marketplace crea KV_REST_API_URL / KV_REST_API_TOKEN (a veces con un prefijo,
// p. ej. STORAGE_KV_REST_API_URL). Una cuenta directa de Upstash usa UPSTASH_REDIS_REST_URL / _TOKEN.
function findCreds() {
  const env = process.env;
  const pairs = [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ];
  for (const [u, t] of pairs) if (env[u] && env[t]) return { url: env[u], token: env[t], names: [u, t] };
  // Con prefijo personalizado
  for (const key of Object.keys(env)) {
    for (const [u, t] of pairs) {
      if (key.endsWith('_' + u)) {
        const prefix = key.slice(0, key.length - u.length);
        if (env[prefix + t]) return { url: env[key], token: env[prefix + t], names: [key, prefix + t] };
      }
    }
  }
  return null;
}

export const creds = findCreds();
export const redis = creds ? new Redis({ url: creds.url, token: creds.token }) : null;

// Nombres (nunca valores) de variables que parecen de Redis, para diagnóstico
export function redisEnvNames() {
  return Object.keys(process.env).filter((k) => /REDIS|KV_|UPSTASH/i.test(k)).sort();
}

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
  res.status(500).json({
    error: 'Base de datos no configurada: el servidor no encuentra las variables de Upstash. Conecta la base en Storage y haz Redeploy.',
    variablesEncontradas: redisEnvNames(),
  });
}

export function fail(res, e) {
  console.error(e);
  res.status(500).json({ error: 'Error con la base de datos: ' + String((e && e.message) || e).slice(0, 200) });
}
