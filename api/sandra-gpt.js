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

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(503).json({ ok: false, error: 'not_configured' });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === 'GET') {
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
      return res.status(400).json({ ok: false, error: 'missing_session' });
    }
    const { data, error } = await supabase
      .from('sandra_gpt_turns')
      .select('client_turn_id, question, answer, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(80);

    if (error) {
      console.error('sandra-gpt GET', error);
      return res.status(500).json({ ok: false, error: 'db_error' });
    }

    const turns = (data || []).map((row) => ({
      id: row.client_turn_id,
      q: row.question,
      a: row.answer,
      t: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    return res.status(200).json({ ok: true, turns });
  }

  if (req.method === 'POST') {
    let body;
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      body = req.body;
    } else {
      try {
        body = await readJsonBody(req);
      } catch (e) {
        return res.status(400).json({ ok: false, error: 'invalid_json' });
      }
    }

    const sessionId = sanitize(body.sessionId, 80);
    if (!sessionId) {
      return res.status(400).json({ ok: false, error: 'missing_session' });
    }

    if (body.action === 'clear') {
      const { error } = await supabase.from('sandra_gpt_turns').delete().eq('session_id', sessionId);
      if (error) {
        console.error('sandra-gpt clear', error);
        return res.status(500).json({ ok: false, error: 'db_error' });
      }
      return res.status(200).json({ ok: true });
    }

    const id = sanitize(body.id, 120);
    const q = sanitize(body.q, MAX_Q);
    const a = sanitize(body.a, MAX_A);
    if (!id || !q) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }

    const { error } = await supabase.from('sandra_gpt_turns').insert({
      session_id: sessionId,
      client_turn_id: id,
      question: q,
      answer: a,
    });

    if (error) {
      if (error.code === '23505') {
        return res.status(200).json({ ok: true, duplicate: true });
      }
      console.error('sandra-gpt insert', error);
      return res.status(500).json({ ok: false, error: 'db_error' });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
};
