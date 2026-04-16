/**
 * Vercel Serverless: SandraGPT turn log (Supabase Postgres).
 * GET  ?sessionId=   → list turns for session
 * POST { sessionId, q, a, id } → insert turn
 * POST { action: 'clear', sessionId } → delete session turns
 *
 * Without env vars, returns 503 so the static client keeps using localStorage only.
 */

const { createClient } = require('@supabase/supabase-js');

const MAX_Q = 500;
const MAX_A = 8000;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error('payload_too_large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sanitize(s, max) {
  if (typeof s !== 'string') return '';
  const t = s.replace(/\u0000/g, '').trim();
  return t.length > max ? t.slice(0, max) : t;
}

/** UUID, anon-*, or t-* client ids; blocks garbage / injection in session keys. */
function isValidSessionId(s) {
  return typeof s === 'string' && /^[a-zA-Z0-9._:-]{8,80}$/.test(s);
}

function isValidClientTurnId(s) {
  return typeof s === 'string' && /^[a-zA-Z0-9._:-]{4,120}$/.test(s);
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) {
    return xff.split(',')[0].trim().slice(0, 64) || 'unknown';
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

const postBuckets = new Map();
const getBuckets = new Map();

function allowRate(map, ip, max, windowMs) {
  const now = Date.now();
  let e = map.get(ip);
  if (!e || now > e.reset) {
    e = { n: 0, reset: now + windowMs };
  }
  if (e.n >= max) {
    map.set(ip, e);
    return false;
  }
  e.n += 1;
  map.set(ip, e);
  if (map.size > 20000) {
    for (const [k, v] of map) {
      if (now > v.reset + windowMs) map.delete(k);
    }
  }
  return true;
}

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(status).json(body);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(204).end();
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return json(res, 503, { ok: false, error: 'not_configured' });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === 'GET') {
    const ip = getClientIp(req);
    if (!allowRate(getBuckets, ip, 120, 60_000)) {
      res.setHeader('Retry-After', '30');
      return json(res, 429, { ok: false, error: 'rate_limited' });
    }

    let sessionId = '';
    if (req.query && (req.query.sessionId || req.query.session)) {
      sessionId = sanitize(String(req.query.sessionId || req.query.session), 80);
    } else if (req.url) {
      try {
        const u = new URL(req.url, 'http://localhost');
        sessionId = sanitize(u.searchParams.get('sessionId') || u.searchParams.get('session') || '', 80);
      } catch (_) {
        sessionId = '';
      }
    }
    if (!sessionId) {
      return json(res, 400, { ok: false, error: 'missing_session' });
    }
    if (!isValidSessionId(sessionId)) {
      return json(res, 400, { ok: false, error: 'invalid_session' });
    }
    const { data, error } = await supabase
      .from('sandra_gpt_turns')
      .select('client_turn_id, question, answer, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(80);

    if (error) {
      console.error('sandra-gpt GET', error);
      return json(res, 500, { ok: false, error: 'db_error' });
    }

    const turns = (data || []).map((row) => ({
      id: row.client_turn_id,
      q: row.question,
      a: row.answer,
      t: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    return json(res, 200, { ok: true, turns });
  }

  if (req.method === 'POST') {
    const ip = getClientIp(req);
    if (!allowRate(postBuckets, ip, 45, 60_000)) {
      res.setHeader('Retry-After', '30');
      return json(res, 429, { ok: false, error: 'rate_limited' });
    }

    let body;
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      body = req.body;
    } else {
      try {
        body = await readJsonBody(req);
      } catch (e) {
        return json(res, 400, { ok: false, error: 'invalid_json' });
      }
    }

    const sessionId = sanitize(body.sessionId, 80);
    if (!sessionId) {
      return json(res, 400, { ok: false, error: 'missing_session' });
    }
    if (!isValidSessionId(sessionId)) {
      return json(res, 400, { ok: false, error: 'invalid_session' });
    }

    if (body.action === 'clear') {
      const { error } = await supabase.from('sandra_gpt_turns').delete().eq('session_id', sessionId);
      if (error) {
        console.error('sandra-gpt clear', error);
        return json(res, 500, { ok: false, error: 'db_error' });
      }
      return json(res, 200, { ok: true });
    }

    const id = sanitize(body.id, 120);
    const q = sanitize(body.q, MAX_Q);
    const a = sanitize(body.a, MAX_A);
    if (!id || !q) {
      return json(res, 400, { ok: false, error: 'missing_fields' });
    }
    if (!isValidClientTurnId(id)) {
      return json(res, 400, { ok: false, error: 'invalid_id' });
    }

    const { error } = await supabase.from('sandra_gpt_turns').insert({
      session_id: sessionId,
      client_turn_id: id,
      question: q,
      answer: a,
    });

    if (error) {
      if (error.code === '23505') {
        return json(res, 200, { ok: true, duplicate: true });
      }
      console.error('sandra-gpt insert', error);
      return json(res, 500, { ok: false, error: 'db_error' });
    }

    return json(res, 200, { ok: true });
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return json(res, 405, { ok: false, error: 'method_not_allowed' });
};
