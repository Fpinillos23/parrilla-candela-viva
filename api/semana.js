import { redis, WEEKS_KEY, weekKey, validWeek, emptyWeek, sanitize, noDb, fail } from './_db.js';

// GET  /api/semana?w=2026-09-28   -> parrilla de esa semana
// PUT  /api/semana  {w, notas}    -> guarda la parrilla de esa semana
export default async function handler(req, res) {
  if (!redis) return noDb(res);
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const w = req.query.w;
      if (!validWeek(w)) return res.status(400).json({ error: 'Semana inválida' });
      const data = await redis.get(weekKey(w));
      return res.status(200).json({ w, notas: (data && data.notas) || emptyWeek(), updatedAt: (data && data.updatedAt) || null });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const w = body.w;
      if (!validWeek(w)) return res.status(400).json({ error: 'Semana inválida' });
      const notas = sanitize(body.notas);
      const updatedAt = new Date().toISOString();
      await redis.set(weekKey(w), { notas, updatedAt });
      await redis.sadd(WEEKS_KEY, w);
      return res.status(200).json({ ok: true, w, updatedAt });
    }

    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return fail(res, e);
  }
}
