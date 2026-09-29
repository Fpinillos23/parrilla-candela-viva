import { redis, creds, redisEnvNames } from './_db.js';

// GET /api/salud -> diagnóstico de la conexión (muestra nombres de variables, nunca sus valores)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const out = {
    servidor: 'ok',
    variablesDeRedisEncontradas: redisEnvNames(),
    variablesUsadas: creds ? creds.names : null,
    baseDeDatos: 'sin configurar',
  };
  if (redis) {
    try {
      await redis.set('parrilla:prueba', new Date().toISOString());
      const v = await redis.get('parrilla:prueba');
      out.baseDeDatos = v ? 'ok: lee y escribe' : 'conecta pero no devolvió el dato';
    } catch (e) {
      out.baseDeDatos = 'error: ' + String((e && e.message) || e).slice(0, 200);
    }
  }
  res.status(200).json(out);
}
