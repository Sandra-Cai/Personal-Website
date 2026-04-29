/**
 * SandraGPT: answers from local notes (keyword + greeting rules).
 * Bot replies are plain text only (no URLs or links in the chat log).
 */
(function () {
  const EMAIL = 'sandraxcyj@gmail.com';
  /** Must match the SandraGPT subtitle on the page (set on load). */
  const TAGLINE = 'Work, startups, trading comps, research, school, or say hi.';

  const REPLY_INDEPENDENT_RESEARCH =
    'Independent work spans equity research, macro and AI writing, and open quant work. The Research section on this page lists pieces and links.';

  /**
   * Multi-word keys use substring match; single-token keys use word boundaries to avoid
   * false positives (e.g. "code" inside "decode", "who" inside "somehow").
   */
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Cache word-boundary regexes (keys are static; avoids allocating on every question). */
  const keyWordRegCache = new Map();

  function keyMatches(q, key) {
    const k = key.toLowerCase();
    if (/\s/.test(k) || /[^\x00-\x7F]/.test(k)) {
      return q.includes(k);
    }
    let re = keyWordRegCache.get(k);
    if (!re) {
      re = new RegExp('\\b' + escapeRegExp(k) + '\\b', 'i');
      keyWordRegCache.set(k, re);
    }
    return re.test(q);
  }

  const KNOWLEDGE = [
    {
      keys: [
        'what is this for',
        "what's this for",
        'what does this do',
        'what is this box',
        'purpose of this',
        'why is this here',
        'how does this work',
        'how does sandragpt',
        'is this chatgpt',
        'is this ai',
        'are you chatgpt',
        'are you an ai',
        'are you a bot',
      ],
      priority: 35,
      reply:
        'Short answers from notes on this site—not a live language model. Ask about a topic from the tagline or something on the page.',
    },
    {
      keys: ['what should i ask', 'what can i ask', 'what to ask', 'how do i use this'],
      priority: 20,
      reply:
        'Anything that fits the tagline—work, startups, trading, research, school—or a pointed question about a section or project on the page.',
    },
    {
      keys: [
        'personal research',
        'independent research',
        'your own research',
        'what research',
        'research do you',
        'type of research',
        'research outside',
        'research on your',
      ],
      priority: 12,
      reply: REPLY_INDEPENDENT_RESEARCH,
    },
    {
      keys: ['internship', 'internships'],
      priority: 22,
      reply:
        'Roles have included quantitative research (Vigil Markets / Nuveaux), research at Microsoft Research Asia, engineering at JD.com, and founding work (Plurall AI). Work and Research on this page have the fuller story.',
    },
    {
      keys: ['four years', '4 years', 'work experience', 'years of experience', 'years of', 'career', 'track record'],
      priority: 15,
      reply:
        'Roughly four years across quant and markets work, institutional research, large-scale engineering, founding, and independent research. I also study CS at NYU—Academic on this page has the coursework detail.',
    },
    {
      keys: [
        'focus areas',
        'markets and quant',
        'ai and systems',
        'what do you focus on',
        'what are your focus areas',
      ],
      priority: 27,
      reply:
        'Core focus areas are markets/quant, independent research, and AI/systems engineering. This site highlights projects where those three overlap.',
    },
    {
      keys: ['standard of proof', 'one standard of proof', 'rigor', 'rigorous', 'show the work'],
      priority: 34,
      reply:
        'The principle is one standard of proof: every claim should include data, a mechanism, and a way to falsify it, in both markets and engineering.',
    },
    {
      keys: ['systems and incentives', 'microstructure and risk', 'microstructure and infrastructure', 'incentives'],
      priority: 29,
      reply:
        'A core theme is systems and incentives: microstructure, risk, and infrastructure should be reasoned about with the same precision in research and in code.',
    },
    {
      keys: ['ship and iterate', 'iterate', 'shipping philosophy', 'build philosophy', 'research informs builds'],
      priority: 24,
      reply:
        'Research should inform builds, and builds should stress-test research; shipping in public keeps that loop honest.',
    },
    {
      keys: ['institutional', 'research & cloud', 'research and cloud'],
      priority: 28,
      reply:
        'That card is MSRA (blockchain finance research) and JD.com (private cloud)—details are in Track record on this page.',
    },
    {
      keys: ['sandragpt', 'sandra gpt', 'this chat', 'this box'],
      priority: 32,
      reply:
        'SandraGPT is a lightweight on-page helper that matches your question to notes from this site; it is not a live LLM.',
    },
    {
      keys: ['vigil', 'nuveaux', 'quantitative researcher', 'clearinghouse', 'counterparty', 'underwriting', 'crypto trading volume'],
      priority: 40,
      reply:
        'At Vigil Markets (Nuveaux Trading), I focused on Python-based crypto volume analysis, counterparty risk, and clearinghouse analytics.',
    },
    {
      keys: ['microsoft research', 'msra', 'microsoft research asia'],
      priority: 40,
      reply: 'At Microsoft Research Asia, I worked on blockchain-finance research connecting protocol design to market and institutional questions.',
    },
    {
      keys: ['jd.com', 'jdcom', 'private cloud'],
      priority: 35,
      reply: 'At JD.com, I built private-cloud infrastructure from low-level systems work through application-scale concerns.',
    },
    {
      keys: ['duke fintech', 'duke', 'fintech trading competition', 'scoreboard'],
      priority: 30,
      reply:
        'I am ranked first on the Duke Fintech Trading Competition scoreboard under their risk-adjusted rules; the Research section links the live board.',
    },
    {
      keys: ['phoenix', 'new york tech week', 'crypto strateg', 'crypto strategy', 'crypto strategies'],
      priority: 30,
      reply: 'I won the Phoenix Trading Competition (crypto strategies) during New York Tech Week in 2023.',
    },
    {
      keys: ['trade', 'trading', 'trader', 'paper trade'],
      priority: 10,
      reply:
        'I take structured trading and markets work seriously—competitions, research writing, and related projects. Work and Research on this page point to specifics.',
    },
    {
      keys: ['quantitative finance', 'quant finance', 'quant research', 'quant'],
      priority: 18,
      reply:
        'Quant-style work shows up at Vigil/Nuveaux, in trading competitions, and in independent research. Work and Research on this page cover each thread.',
    },
    {
      keys: ['aerovironment', 'avav', 'equity pitch', 'pe-backed'],
      priority: 35,
      reply: 'The AeroVironment (AVAV) thesis is listed under Research on this page.',
    },
    {
      keys: ['jane street', 'india ban', 'sebi', 'microstructure', 'inside the ban'],
      priority: 45,
      reply:
        'I published “Inside the Ban: A Quantitative Autopsy of Jane Street’s Trading Tactics in India” (open repo; announcement on LinkedIn from this site).',
    },
    {
      keys: ['bayes', 'bayesian', 'decision-making', 'theorem of wisdom', 'urc'],
      priority: 35,
      reply:
        '“Theorem of Wisdom” (Bayesian decision-making) is on GitHub; related work was presented at NYU URC.',
    },
    {
      keys: ['chip war', 'ai performance', 'supply chain', 'geopolitical', 'oscar', 'hawkish', 'dovish'],
      priority: 12,
      reply: 'I have Medium pieces on AI and macro themes; the profile is linked from this page.',
    },
    {
      keys: ['medium', 'linkedin', 'macro', 'macroeconomic'],
      priority: 8,
      reply: 'Longer threads are on LinkedIn and Medium; Substack is @caisandra. Links are in the header and social strips.',
    },
    {
      keys: ['school', 'nyu', 'major', 'minor', 'degree', 'bemet', 'bemt', 'mathematics minor'],
      priority: 25,
      reply:
        'NYU: Computer Science major, minors in Mathematics and BEMT (Business of Entertainment, Media and Technology).',
    },
    {
      keys: [
        'who are you',
        'who you are',
        'who r u',
        'who are u',
        'tell me about yourself',
        'tell me about u',
        'describe yourself',
        'about you',
        'introduce yourself',
        'introduce',
        'your background',
        'background',
      ],
      priority: 20,
      reply:
        'Sandra Cai—markets and engineering background, independent research, and CS at NYU. Work and Research on this page are the overview.',
    },
    {
      keys: [
        'what is your name',
        "what's your name",
        'what is ur name',
        'whats your name',
        'your full name',
        'call you',
      ],
      priority: 24,
      reply: 'Sandra Cai. Work, Academic, and Research on this page fill in projects and school.',
    },
    {
      keys: ['where are you', 'where do you live', 'where are you based', 'based in', 'which city', 'location'],
      priority: 18,
      reply: 'I study at NYU in New York. Academic on this page has the program detail.',
    },
    {
      keys: ['open to work', 'available', 'availability', 'hiring', 'recruiting', 'recruiter'],
      priority: 16,
      reply: `For recruiting or collaboration, reach out at ${EMAIL} or LinkedIn with role scope, timeline, and context.`,
    },
    {
      keys: [
        'plurall',
        'plurall ai',
        'deepfake',
        'founder',
        'founding',
        'found',
        'what are you founding',
        'what are you building',
        'what are you working on',
        'what do you found',
        'what did you found',
        'startup',
      ],
      priority: 42,
      reply:
        'I am building Plurall AI, a deepfake-detection company focused on trust and verification for AI-generated media.',
    },
    {
      keys: [
        'why this website',
        'why this site',
        'purpose of this website',
        'why did you build this',
        'private school',
        '600,000 education',
      ],
      priority: 28,
      reply:
        'The site is meant to share what I learned from a high-cost private-school path in a public, practical way through projects, research, and operating experience.',
    },
    {
      keys: ['pennapps', 'blockchain project', 'best blockchain'],
      priority: 25,
      reply: 'At PennApps I shipped an AI + blockchain app that won Best Blockchain Project; code is on GitHub.',
    },
    {
      keys: ['skills', 'tech stack', 'languages do you', 'python', 'typescript', 'machine learning', 'ml'],
      priority: 15,
      reply:
        'Python is central to quant and research work (e.g. Vigil/Nuveaux); ML and full-stack work show up in projects listed under Work and GitHub on this page.',
    },
    {
      keys: ['github', 'code', 'engineering', 'build'],
      priority: 8,
      reply: 'Repos (papers, projects, tooling) are under Sandra-Cai on GitHub.',
    },
    {
      keys: ['what projects', 'side project', 'portfolio', 'pet project', 'showcase'],
      priority: 12,
      reply: 'Highlighted work is under Work and Research; code and papers are linked from GitHub (Sandra-Cai).',
    },
    {
      keys: ['passion', 'interest', 'focus', 'why finance'],
      priority: 5,
      reply: 'I focus on where careful financial analysis meets solid engineering—in markets, research, and product.',
    },
    {
      keys: ['substack', 'writing', 'essay'],
      priority: 5,
      reply: 'Essays on Substack (@caisandra); quant and macro threads also on LinkedIn and Medium.',
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'collaborat'],
      priority: 5,
      reply: `${EMAIL} or LinkedIn. Please include scope and relevant links.`,
    },
    {
      keys: ['resume', 'cv', 'résumé'],
      priority: 10,
      reply: `I do not post a resume publicly. For recruiting or collaboration: ${EMAIL} or LinkedIn.`,
    },
  ];

  const DEFAULT_REPLIES = [
    'Try a topic from the tagline, or ask about something specific on the page.',
    'Ask about Work, Research, or Academic, or use a specific phrase you see on the site.',
    'Try a section name (Track record, Research, Academic) or a company/project listed above.',
    'Name a company, paper title, or competition from the page and I can usually answer from that note.',
  ];
  const SUGGESTED_TOPICS = [
    'Plurall AI',
    'Vigil Markets / Nuveaux',
    'Microsoft Research Asia',
    'JD.com private cloud',
    'Duke Fintech competition',
    'Phoenix trading competition',
    'AeroVironment thesis',
    'Jane Street India ban autopsy',
    'NYU academics',
  ];

  /** Stable default so the same question always gets the same generic reply (not random). */
  function defaultReplyIndex(q) {
    let h = 0;
    for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) | 0;
    return Math.abs(h) % DEFAULT_REPLIES.length;
  }

  function normalize(s) {
    return s
      .normalize('NFKC')
      .replace(/[\u2018\u2019\u2032\u0060\u00B4]/g, "'")
      .replace(/\u2013|\u2014/g, '-')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  function normalizeToTokens(s) {
    return normalize(s)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(' ')
      .filter(Boolean);
  }

function topicStartIndexFor(q) {
let h = 0;
for (let i = 0; i < q.length; i++) h = (h * 33 + q.charCodeAt(i)) | 0;
return Math.abs(h) % SUGGESTED_TOPICS.length;
}

  /**
   * Pick a few relevant site topics for unmatched questions using token overlap.
   * This keeps fallback answers specific without pretending to know unknown facts.
   */
  function suggestTopicsFor(q) {
    const qTokens = new Set(normalizeToTokens(q));
    if (!qTokens.size) return [];

    const scored = SUGGESTED_TOPICS.map((topic) => {
      const topicTokens = normalizeToTokens(topic);
      let overlap = 0;
      for (const token of topicTokens) {
        if (qTokens.has(token)) overlap++;
      }
      return { topic, score: overlap };
    })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic))
      .slice(0, 3)
      .map((row) => row.topic);

    if (scored.length) return scored;
const start = topicStartIndexFor(q);
return Array.from({ length: 3 }, (_, i) => SUGGESTED_TOPICS[(start + i) % SUGGESTED_TOPICS.length]);
  }

  function greetingReply(q) {
    const t = q.trim();
    if (/^(hi|hey|hello|yo|sup)[!?.]*$/i.test(t)) return true;
    if (/^(hi|hey|hello)\s+there[!?.]*$/i.test(t)) return true;
    if (/^good (morning|afternoon|evening)[!?.]*$/i.test(t)) return true;
    return false;
  }

  function thanksReply(q) {
    const t = q.trim();
    if (/^(thanks|thank you|thx|ty|appreciate it)[!?.]*$/i.test(t)) return true;
    return false;
  }

  function goodbyeReply(q) {
    const t = q.trim();
    if (
      /^(bye|goodbye|good bye|see you|see ya|cya|later|goodnight|good night)[!?.]*$/i.test(t)
    ) {
      return true;
    }
    return false;
  }

  /** Matches casual well-being checks like "how are you". */
  function looksLikeHowAreYou(q) {
    return (
      /\bhow are you\b/.test(q) ||
      /\bhow r u\b/.test(q) ||
      /\bhow are u\b/.test(q) ||
      /\bhow are you doing\b/.test(q) ||
      /\bhow's it going\b/.test(q) ||
      /\bhow is it going\b/.test(q)
    );
  }

  /** Matches "what do you do?" and close variants (keyboard typos like dp for do, u for you). */
  function looksLikeWhatDoYouDo(q) {
    return (
      /\bwhat do you (do|dp|od)\b/.test(q) ||
      /\bwhat do u (do|dp|od)\b/.test(q) ||
      /\bwhat do you found\b/.test(q) ||
      /\bwhat do u found\b/.test(q) ||
      /\bwhat did you found\b/.test(q) ||
      /\bwhat you do\b/.test(q) ||
      /\bwhat's your job\b/.test(q) ||
      /\bwhat is your job\b/.test(q) ||
      /\bwhat is your role\b/.test(q) ||
      /\bwhat work do you do\b/.test(q) ||
      /\bwhat do you work on\b/.test(q) ||
      /\bdescribe your work\b/.test(q)
    );
  }

  function answerFor(question) {
    const q = normalize(question);
    if (!q) return 'Type a question above.';

    if (greetingReply(q)) {
      return 'Hi - ask a question whenever you are ready.';
    }

    if (thanksReply(q)) {
      return 'You are welcome - ask another whenever you like.';
    }

    if (goodbyeReply(q)) {
      return 'Take care. You can come back to this box anytime.';
    }

    if (looksLikeHowAreYou(q)) {
      return 'Doing well, thanks for asking. Ask about work, research, trading competitions, school, or anything specific on this page.';
    }

    if (/^(what is this|what's this)\??$/.test(q)) {
      return 'Short answers from notes on this site - not a live language model. Ask about a topic from the tagline or anything listed on the page.';
    }

    if (
      /\bwhat do you do for fun\b|\bfor fun\b|\bhobbies\b|\bwhat do you do in your (free|spare) time\b/.test(q)
    ) {
      return 'Reading, writing about markets and tech, and joining trading-style competitions when time allows.';
    }

    // "What do you do?" — include common typos (e.g. dp for do) and casual phrasing; not a live model so no spellcheck
    if (looksLikeWhatDoYouDo(q)) {
      return 'I am building Plurall AI while working across quant research, markets, and systems engineering, and studying CS at NYU; the Work, Research, and Academic sections break this down.';
    }

    let best = null;
    let bestTuple = [-1, -1, -1]; // score, maxKeyLen, priority — lexicographic tie-break
    for (const row of KNOWLEDGE) {
      let maxKeyLen = 0;
      let matchCount = 0;
      for (const key of row.keys) {
        if (keyMatches(q, key)) {
          matchCount++;
          maxKeyLen = Math.max(maxKeyLen, key.length);
        }
      }
      if (matchCount === 0) continue;
      const pri = row.priority || 0;
      const score = maxKeyLen * 1000 + pri * 10 + matchCount;
      const tuple = [score, maxKeyLen, pri];
      if (
        tuple[0] > bestTuple[0] ||
        (tuple[0] === bestTuple[0] && tuple[1] > bestTuple[1]) ||
        (tuple[0] === bestTuple[0] && tuple[1] === bestTuple[1] && tuple[2] > bestTuple[2])
      ) {
        bestTuple = tuple;
        best = row.reply;
      }
    }
    if (best) return best;

    if (/\bresearch\b/.test(q) && !/\bresearcher\b/.test(q)) {
      return REPLY_INDEPENDENT_RESEARCH;
    }

    const fallback = DEFAULT_REPLIES[defaultReplyIndex(q)];
    const suggestions = suggestTopicsFor(q);
    if (!suggestions.length) return fallback;
    return `${fallback} Try asking about: ${suggestions.join(', ')}.`;
  }

  const STORAGE_KEY = 'sandra-gpt-history-v1';
  const SESSION_KEY = 'sandra-gpt-session';
  const MAX_TURNS = 80;
  const MAX_QUESTION_CHARS = 280;
  const DUPLICATE_SUBMIT_WINDOW_MS = 1500;
  const RESET_HISTORY_ON_LOAD = true;

  const form = document.getElementById('gpt-form');
  const input = document.getElementById('gpt-input');
  const logEl = document.getElementById('gpt-log');
  const sidebarList = document.getElementById('gpt-sidebar-list');
  const clearBtn = document.getElementById('gpt-clear-history');
  const syncStatusEl = document.getElementById('gpt-sync-status');
  let submitBusy = false;
  let lastSubmittedCanonical = '';
  let lastSubmittedAt = 0;

  function getOrCreateSessionId() {
    try {
      let sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, sid);
      }
      return sid;
    } catch {
      return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return normalizeTurns(data);
    } catch {
      return [];
    }
  }

  function saveHistory(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimTurns(entries)));
    } catch {
      /* quota or private mode */
    }
  }

  function trimTurns(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.slice(-MAX_TURNS);
  }

  function normalizeTurns(entries) {
    if (!Array.isArray(entries)) return [];
    const out = [];
    for (const row of entries) {
      if (!row || typeof row !== 'object') continue;
      const q = typeof row.q === 'string' ? row.q.trim() : '';
      if (!q) continue;
      const a = typeof row.a === 'string' ? row.a : '';
      const id = typeof row.id === 'string' && row.id ? row.id : newTurnId();
      const t = typeof row.t === 'number' ? row.t : Date.now();
      out.push({ id, q, a, t });
    }
    return trimTurns(out);
  }

  /**
   * @returns {{ apiDisabled: boolean, turns: Array<{id:string,q:string,a:string,t?:number}>|null }}
   */
  async function fetchRemoteHistory(sessionId) {
    try {
      const r = await fetch(`/api/sandra-gpt?sessionId=${encodeURIComponent(sessionId)}`);
      if (r.status === 503 || r.status === 404) {
        return { apiDisabled: true, turns: null };
      }
      if (!r.ok) {
        return { apiDisabled: false, turns: null };
      }
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        return { apiDisabled: false, turns: null };
      }
      const j = await r.json();
      if (!j.ok || !Array.isArray(j.turns)) {
        return { apiDisabled: false, turns: null };
      }
      return { apiDisabled: false, turns: j.turns };
    } catch {
      return { apiDisabled: true, turns: null };
    }
  }

  function setSyncStatus(mode, detail) {
    if (!syncStatusEl) return;
    syncStatusEl.textContent = '';
    syncStatusEl.classList.remove('gpt-sync-status--ok', 'gpt-sync-status--warn');
    if (mode === 'server') {
      syncStatusEl.textContent = 'Database sync on';
      syncStatusEl.classList.add('gpt-sync-status--ok');
    } else if (mode === 'local') {
      syncStatusEl.textContent = 'Browser only (no API)';
    } else if (mode === 'warn') {
      syncStatusEl.textContent =
        detail === 'rate'
          ? 'Server busy; saved in browser only'
          : detail === 'partial'
            ? 'Partially synced; retrying later'
          : 'Couldn’t sync; saved in browser only';
      syncStatusEl.classList.add('gpt-sync-status--warn');
    } else {
      syncStatusEl.textContent = '';
    }
  }

  function handleSyncError(err) {
    if (err && err.message === 'partial_sync_failed') {
      setSyncStatus('warn', 'partial');
    } else if (err && err.message === 'rate_limited') {
      setSyncStatus('warn', 'rate');
    } else {
      setSyncStatus('warn');
    }
  }

  async function postTurnRemote(sessionId, id, q, a) {
    const payload = JSON.stringify({ sessionId, id, q, a });
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch('/api/sandra-gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (r.status === 503) return;
      if (r.ok) return;
      if (r.status === 429) {
        throw new Error('rate_limited');
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
    }
    throw new Error('post_failed');
  }

  /**
   * Push local-only turns after offline or pre-API use.
   * @returns {Promise<boolean>} true if at least one turn was uploaded
   */
  async function syncUnsavedTurnsToServer(sessionId) {
    const snap = normalizeTurns(loadHistory());
    if (!snap.length) return false;
    const remote = await fetchRemoteHistory(sessionId);
    if (remote.apiDisabled || !remote.turns) return false;
    const have = new Set(remote.turns.map((t) => t.id));
    let uploadedAny = false;
    let pendingFailures = false;
    for (const row of snap) {
      if (!row || typeof row.id !== 'string') continue;
      if (have.has(row.id)) continue;
      try {
        await postTurnRemote(sessionId, row.id, row.q, row.a);
        uploadedAny = true;
      } catch (err) {
        if (err && err.message === 'rate_limited') {
          throw err;
        }
        pendingFailures = true;
      }
    }
    if (pendingFailures) {
      throw new Error('partial_sync_failed');
    }
    return uploadedAny;
  }

  async function clearRemote(sessionId) {
    try {
      const r = await fetch('/api/sandra-gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', sessionId }),
      });
      if (r.status === 503) return false;
      return r.ok;
    } catch {
      return false;
    }
  }

  function newTurnId() {
    return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function scrollToTurn(turnId) {
    const el = document.getElementById(`gpt-turn-${turnId}`);
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function renderTurn(turnId, q, answerText, doScroll) {
    const wrap = document.createElement('section');
    wrap.className = 'gpt-turn';
    wrap.id = `gpt-turn-${turnId}`;
    wrap.setAttribute('aria-label', 'Question and reply');

    const userDiv = document.createElement('div');
    userDiv.className = 'gpt-msg gpt-msg--user';
    const pu = document.createElement('p');
    pu.textContent = q;
    userDiv.appendChild(pu);

    const botDiv = document.createElement('div');
    botDiv.className = 'gpt-msg gpt-msg--bot';
    const pb = document.createElement('p');
    pb.textContent = answerText;
    botDiv.appendChild(pb);

    wrap.appendChild(userDiv);
    wrap.appendChild(botDiv);
    logEl.appendChild(wrap);

    if (doScroll !== false) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function addSidebarEntry(turnId, questionText) {
    if (!sidebarList) return;

    const li = document.createElement('li');
    li.className = 'gpt-sidebar-item-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gpt-sidebar-item';
    btn.dataset.turnId = turnId;
    const label = questionText.length > 52 ? `${questionText.slice(0, 51)}…` : questionText;
    btn.textContent = label;
    btn.title = questionText;
    btn.setAttribute('aria-current', 'false');
    btn.addEventListener('click', () => {
      sidebarList.querySelectorAll('.gpt-sidebar-item').forEach((n) => {
        n.classList.remove('gpt-sidebar-item--active');
        n.setAttribute('aria-current', 'false');
      });
      btn.classList.add('gpt-sidebar-item--active');
      btn.setAttribute('aria-current', 'true');
      scrollToTurn(turnId);
    });

    li.appendChild(btn);
    sidebarList.appendChild(li);
  }

  function pruneRenderedHistoryUI() {
    if (!logEl || !sidebarList) return;
    while (logEl.children.length > MAX_TURNS) {
      const oldTurn = logEl.firstElementChild;
      if (!oldTurn) break;
      logEl.removeChild(oldTurn);
    }
    while (sidebarList.children.length > MAX_TURNS) {
      const oldSidebar = sidebarList.firstElementChild;
      if (!oldSidebar) break;
      sidebarList.removeChild(oldSidebar);
    }
  }

  function getRecentQuestions(limit) {
    const out = [];
    const seen = new Set();
    const entries = normalizeTurns(loadHistory());
    for (let i = entries.length - 1; i >= 0; i--) {
      const q = entries[i] && typeof entries[i].q === 'string' ? entries[i].q.trim() : '';
      if (!q) continue;
      const canonical = normalize(q);
      if (!canonical || seen.has(canonical)) continue;
      seen.add(canonical);
      out.push(q);
      if (out.length >= limit) break;
    }
    return out;
  }

  function shouldHandleRecallKey(e, field) {
    if (!field) return false;
    if (typeof field.selectionStart !== 'number' || typeof field.selectionEnd !== 'number') {
      return true;
    }
    // Respect normal caret movement unless the cursor is at the boundary.
    if (field.selectionStart !== field.selectionEnd) return false;
    if (e.key === 'ArrowUp') return field.selectionStart === 0;
    if (e.key === 'ArrowDown') return field.selectionStart === field.value.length;
    return false;
  }

  async function clearAllHistory() {
    if (
      !window.confirm(
        'Clear all questions and answers from this browser and from the server (for this session), if the database API is enabled?'
      )
    ) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (logEl) logEl.innerHTML = '';
    if (sidebarList) sidebarList.innerHTML = '';
    const clearedOnServer = await clearRemote(getOrCreateSessionId());
    setSyncStatus(clearedOnServer ? 'server' : 'local');
    if (input) input.focus();
  }

  async function restoreHistory() {
    if (!logEl || !sidebarList) return;
    const sessionId = getOrCreateSessionId();
    const { apiDisabled, turns: remote } = await fetchRemoteHistory(sessionId);

    logEl.innerHTML = '';
    sidebarList.innerHTML = '';

    if (!apiDisabled && remote && remote.length > 0) {
      const recentRemote = normalizeTurns(remote);
      for (const row of recentRemote) {
        if (!row || typeof row.id !== 'string' || typeof row.q !== 'string') continue;
        const a = typeof row.a === 'string' ? row.a : '';
        renderTurn(row.id, row.q, a, false);
        addSidebarEntry(row.id, row.q);
      }
      saveHistory(
        recentRemote.map((r) => ({
          id: r.id,
          q: r.q,
          a: r.a,
          t: typeof r.t === 'number' ? r.t : Date.now(),
        }))
      );
      setSyncStatus('server');
      return;
    }

    const entries = normalizeTurns(loadHistory());
    for (const row of entries) {
      if (!row || typeof row.id !== 'string' || typeof row.q !== 'string') continue;
      const a = typeof row.a === 'string' ? row.a : '';
      renderTurn(row.id, row.q, a, false);
      addSidebarEntry(row.id, row.q);
    }

    setSyncStatus(apiDisabled ? 'local' : 'server');
    if (!apiDisabled && entries.length > 0) {
      void syncUnsavedTurnsToServer(sessionId)
        .then((did) => {
          if (did) setSyncStatus('server');
        })
        .catch(handleSyncError);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submitBusy) return;
    const q = input.value.trim();
    if (!q) return;
    const canonicalQ = normalize(q);
    const now = Date.now();
    if (canonicalQ === lastSubmittedCanonical && now - lastSubmittedAt < DUPLICATE_SUBMIT_WINDOW_MS) {
      input.focus();
      return;
    }
    if (q.length > MAX_QUESTION_CHARS) {
      const turnId = newTurnId();
      const msg = `Please keep questions under ${MAX_QUESTION_CHARS} characters.`;
      renderTurn(turnId, q, msg);
      addSidebarEntry(turnId, q);
      input.value = '';
      return;
    }

    submitBusy = true;
    window.setTimeout(() => {
      submitBusy = false;
    }, 260);

    const turnId = newTurnId();
    const answerText = answerFor(q);
    lastSubmittedCanonical = canonicalQ;
    lastSubmittedAt = now;
    input.value = '';

    if (form) {
      const sendBtn = form.querySelector('.gpt-send');
      form.setAttribute('aria-busy', 'true');
      if (sendBtn) sendBtn.disabled = true;
      window.setTimeout(() => {
        form.setAttribute('aria-busy', 'false');
        if (sendBtn) sendBtn.disabled = false;
      }, 180);
    }

    renderTurn(turnId, q, answerText);
    addSidebarEntry(turnId, q);
    pruneRenderedHistoryUI();

    const entries = normalizeTurns(loadHistory());
    entries.push({ id: turnId, q, a: answerText, t: Date.now() });
    saveHistory(entries);

    const sid = getOrCreateSessionId();
    postTurnRemote(sid, turnId, q, answerText)
      .then(() => {
        setSyncStatus('server');
      })
      .catch((err) => {
        if (err && err.message === 'rate_limited') {
          setSyncStatus('warn', 'rate');
        } else {
          setSyncStatus('warn');
        }
      });

    window.requestAnimationFrame(() => {
      input.focus();
    });
  }

  const taglineEl = document.getElementById('gpt-tagline');
  if (taglineEl) {
    taglineEl.textContent = TAGLINE;
  }

  if (form && input && logEl) {
    if (RESET_HISTORY_ON_LOAD) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
    }
    input.setAttribute('maxlength', String(MAX_QUESTION_CHARS));
    void restoreHistory();
    form.addEventListener('submit', handleSubmit);
    let recallIndex = -1;
    let draftBeforeRecall = '';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        if (!shouldHandleRecallKey(e, input)) return;
        const questions = getRecentQuestions(20);
        if (!questions.length) return;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (recallIndex === -1) {
            draftBeforeRecall = input.value;
            recallIndex = 0;
          } else {
            recallIndex = Math.min(recallIndex + 1, questions.length - 1);
          }
          input.value = questions[recallIndex] || '';
          return;
        }
        e.preventDefault();
        if (recallIndex <= 0) {
          recallIndex = -1;
          input.value = draftBeforeRecall;
        } else {
          recallIndex -= 1;
          input.value = questions[recallIndex] || '';
        }
        return;
      }
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
      e.preventDefault();
      form.requestSubmit();
    });
    input.addEventListener('input', () => {
      if (recallIndex !== -1) {
        recallIndex = -1;
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      void clearAllHistory();
    });
  }

  /** When the network comes back, try to upload any turns still only in the browser. */
  let onlineDebounce;
  window.addEventListener('online', () => {
    window.clearTimeout(onlineDebounce);
    onlineDebounce = window.setTimeout(() => {
      const sid = getOrCreateSessionId();
      void syncUnsavedTurnsToServer(sid)
        .then((did) => {
          if (did) setSyncStatus('server');
        })
        .catch(handleSyncError);
    }, 450);
  });

  const agentSection = document.getElementById('sandra-gpt');
  if (agentSection && input) {
    agentSection.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.activeElement !== input) return;
      e.preventDefault();
      input.blur();
    });
  }
})();
