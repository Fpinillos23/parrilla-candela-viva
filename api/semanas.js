import { redis, WEEKS_KEY, weekKey, DAYS, noDb, fail } from './_db.js';

// GET /api/semanas -> historial: semanas guardadas con su conteo de notas
export default async function handler(req, res) {
  if (!redis) return noDb(res);
  res.setHeader('Cache-Control', 'no-store');
  try {
    const weeks = ((await redis.smembers(WEEKS_KEY)) || []).sort().reverse();
    if (!weeks.length) return res.status(200).json({ semanas: [] });
    const rows = await redis.mget(...weeks.map(weekKey));
    const semanas = weeks.map((w, i) => {
      const notas = (rows[i] && rows[i].notas) || {};
      let total = 0, hechas = 0;
      for (const d of DAYS) for (const n of notas[d] || []) { total++; if (n.done) hechas++; }
      return { w, total, hechas, updatedAt: (rows[i] && rows[i].updatedAt) || null };
    });
    return res.status(200).json({ semanas });
  } catch (e) {
    return fail(res, e);
  }
}
