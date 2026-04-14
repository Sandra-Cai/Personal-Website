/**
 * SandraGPT: answers from local notes (keyword + greeting rules).
 * Bot replies are plain text only (no URLs or links in the chat log).
 */
(function () {
  const EMAIL = 'sandraxcyj@gmail.com';
  /** Must match the SandraGPT subtitle on the page (set on load). */
  const TAGLINE = 'Work, startups, trading comps, research, school, or say hi.';

  const REPLY_INDEPENDENT_RESEARCH =
    'Independent work includes equity research, macro and AI writing, and open quant pieces. See Research on this page for the list.';

  const KNOWLEDGE = [
    {
      keys: [
        'what is this for',
        "what's this for",
        'what does this do',
        'what is this box',
        'purpose of this',
        'why is this here',
      ],
      reply:
        'Short answers from notes on this site—not a live model. Ask about a topic from the tagline or something on the page.',
    },
    {
      keys: ['what should i ask', 'what can i ask', 'what to ask', 'how do i use this'],
      reply:
        'Anything that fits the tagline—work, startups, trading, research, school—or a specific question about something on the page.',
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
      reply: REPLY_INDEPENDENT_RESEARCH,
    },
    {
      keys: ['internship', 'internships'],
      reply:
        'Roles have included quantitative research (Vigil Markets / Nuveaux), research at Microsoft Research Asia, engineering at JD.com, and founding work (Plurall AI). More context is in the Work and Research sections.',
    },
    {
      keys: ['four years', '4 years', 'experience', 'work experience', 'years of', 'career', 'track record', 'professional'],
      reply:
        'About four years across quant and markets work, institutional research, large-scale engineering, founding, and independent research. I also study CS at NYU—see Academic on this page.',
    },
    {
      keys: ['institutional', 'research & cloud', 'research and cloud'],
      reply:
        'That card is MSRA (blockchain finance research) and JD.com (private cloud)—details are in Track record on this page.',
    },
    {
      keys: ['sandragpt', 'sandra gpt', 'this chat', 'this box'],
      reply:
        'SandraGPT is a small on-page helper: keyword matches against notes from this site, not a live LLM. For details, read the line under the input box.',
    },
    {
      keys: ['vigil', 'nuveaux', 'quantitative researcher', 'clearinghouse', 'counterparty', 'underwriting', 'crypto trading volume'],
      reply:
        'At Vigil Markets (Nuveaux Trading) I focused on Python-based crypto volume analysis, counterparty risk, and clearinghouse-related analytics.',
    },
    {
      keys: ['microsoft research', 'msra', 'microsoft research asia'],
      reply: 'At Microsoft Research Asia I worked on blockchain-related financial research connecting protocols to market and institutional questions.',
    },
    {
      keys: ['jd.com', 'jdcom', 'private cloud'],
      reply: 'At JD.com I built private cloud infrastructure across low-level systems through application-scale concerns.',
    },
    {
      keys: ['duke fintech', 'duke', 'fintech trading competition', 'scoreboard'],
      reply:
        'I am first on the Duke Fintech Trading Competition scoreboard under their risk-adjusted rules. The Research section links the live board.',
    },
    {
      keys: ['phoenix', 'new york tech week', 'crypto strateg'],
      reply: 'I won the Phoenix Trading Competition (crypto strategies) during New York Tech Week in 2023.',
    },
    {
      keys: ['trade', 'trading', 'trader', 'paper trade'],
      reply:
        'I take structured trading and markets work seriously—competitions, research writing, and related projects; pointers are on this page.',
    },
    {
      keys: ['aerovironment', 'avav', 'equity pitch', 'pe-backed'],
      reply: 'The AeroVironment (AVAV) thesis is listed under Research on this page.',
    },
    {
      keys: ['jane street', 'india ban', 'sebi', 'microstructure', 'inside the ban'],
      reply:
        'I published “Inside the Ban: A Quantitative Autopsy of Jane Street’s Trading Tactics in India” (open repo; announcement on LinkedIn from this site).',
    },
    {
      keys: ['bayes', 'bayesian', 'decision-making', 'theorem of wisdom', 'urc'],
      reply:
        '“Theorem of Wisdom” (Bayesian decision-making) is on GitHub; related work was presented at NYU URC.',
    },
    {
      keys: ['chip war', 'ai performance', 'supply chain', 'geopolitical', 'oscar', 'hawkish', 'dovish'],
      reply: 'I have Medium pieces on AI and macro; the profile is linked from this page.',
    },
    {
      keys: ['medium', 'linkedin', 'macro', 'macroeconomic'],
      reply: 'Longer threads are on LinkedIn and Medium; Substack is @caisandra. Links are in the header and strips.',
    },
    {
      keys: ['school', 'nyu', 'major', 'minor', 'degree', 'bemet', 'bemt', 'mathematics minor'],
      reply:
        'NYU: Computer Science major, minors in Mathematics and BEMT (Business of Entertainment, Media and Technology).',
    },
    {
      keys: ['who', 'yourself', 'about you', 'introduce', 'background', 'who are you'],
      reply:
        'Sandra Cai—markets and engineering background, independent research, and CS at NYU. Work and Research on this page are the overview.',
    },
    {
      keys: ['plurall', 'deepfake', 'founder', 'startup'],
      reply: 'Plurall AI is a deepfake-detection product I built; more engineering work is on GitHub.',
    },
    {
      keys: ['pennapps', 'blockchain project', 'best blockchain'],
      reply: 'At PennApps I shipped an AI + blockchain app that won Best Blockchain Project; code is on GitHub.',
    },
    {
      keys: ['github', 'code', 'engineering', 'build'],
      reply: 'Repos (papers, projects, tooling) are under Sandra-Cai on GitHub.',
    },
    {
      keys: ['passion', 'interest', 'focus', 'why finance'],
      reply: 'I focus on where careful financial analysis meets solid engineering—in markets, research, and product.',
    },
    {
      keys: ['substack', 'writing', 'essay'],
      reply: 'Essays on Substack (@caisandra); quant and macro threads also on LinkedIn and Medium.',
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'collaborat'],
      reply: `${EMAIL} or LinkedIn. Please include scope and relevant links.`,
    },
    {
      keys: ['resume', 'cv', 'résumé'],
      reply: `I do not post a resume publicly. For recruiting or collaboration: ${EMAIL} or LinkedIn.`,
    },
  ];

  const DEFAULT_REPLIES = [
    'Try a topic from the tagline or ask about something on the page.',
    'Pick work, research, school, or a specific phrase from the page—I match against what is written here.',
    'Ask about a section (Track record, Research, Academic) or a company or project name you see above.',
  ];

  function normalize(s) {
    return s.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function greetingReply(q) {
    const t = q.trim();
    if (/^(hi|hey|hello|yo|sup)[!?.]*$/i.test(t)) return true;
    if (/^good (morning|afternoon|evening)[!?.]*$/i.test(t)) return true;
    return false;
  }

  function thanksReply(q) {
    const t = q.trim();
    if (/^(thanks|thank you|thx|ty|appreciate it)[!?.]*$/i.test(t)) return true;
    return false;
  }

  /** Matches "what do you do?" and close variants (keyboard typos like dp for do, u for you). */
  function looksLikeWhatDoYouDo(q) {
    return (
      /\bwhat do you (do|dp|od)\b/.test(q) ||
      /\bwhat do u (do|dp|od)\b/.test(q) ||
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
      return 'Hello. Ask a question whenever you are ready.';
    }

    if (thanksReply(q)) {
      return 'You are welcome. Ask another question whenever you like.';
    }

    if (/^(what is this|what's this)\??$/.test(q)) {
      return 'Short answers from notes on this site—not a live model. Ask about a topic from the tagline or something on the page.';
    }

    if (
      /\bwhat do you do for fun\b|\bfor fun\b|\bhobbies\b|\bwhat do you do in your (free|spare) time\b/.test(q)
    ) {
      return 'Reading, writing on markets and tech, and trading-style competitions when time allows.';
    }

    // "What do you do?" — include common typos (e.g. dp for do) and casual phrasing; not a live model so no spellcheck
    if (looksLikeWhatDoYouDo(q)) {
      return "I'm the founder of Plurall AI. I also study CS at NYU; markets, research, and other engineering work are in Work and Research on this page.";
    }

    let best = null;
    let bestScore = 0;
    for (const row of KNOWLEDGE) {
      let score = 0;
      for (const key of row.keys) {
        if (q.includes(key)) score += key.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = row.reply;
      }
    }
    if (best && bestScore > 0) return best;

    if (/\bresearch\b/.test(q) && !/\bresearcher\b/.test(q)) {
      return REPLY_INDEPENDENT_RESEARCH;
    }

    return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
  }

  const STORAGE_KEY = 'sandra-gpt-history-v1';
  const SESSION_KEY = 'sandra-gpt-session';
  const MAX_TURNS = 80;

  const form = document.getElementById('gpt-form');
  const input = document.getElementById('gpt-input');
  const logEl = document.getElementById('gpt-log');
  const sidebarList = document.getElementById('gpt-sidebar-list');
  const clearBtn = document.getElementById('gpt-clear-history');
  const syncStatusEl = document.getElementById('gpt-sync-status');

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
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveHistory(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_TURNS)));
    } catch {
      /* quota or private mode */
    }
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
          : 'Couldn’t sync; saved in browser only';
      syncStatusEl.classList.add('gpt-sync-status--warn');
    } else {
      syncStatusEl.textContent = '';
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
    const snap = loadHistory();
    if (!snap.length) return false;
    const remote = await fetchRemoteHistory(sessionId);
    if (remote.apiDisabled || !remote.turns) return false;
    const have = new Set(remote.turns.map((t) => t.id));
    let didAny = false;
    for (const row of snap) {
      if (!row || typeof row.id !== 'string') continue;
      if (have.has(row.id)) continue;
      didAny = true;
      await postTurnRemote(sessionId, row.id, row.q, row.a);
    }
    return didAny;
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
  }

  async function restoreHistory() {
    if (!logEl || !sidebarList) return;
    const sessionId = getOrCreateSessionId();
    const { apiDisabled, turns: remote } = await fetchRemoteHistory(sessionId);

    logEl.innerHTML = '';
    sidebarList.innerHTML = '';

    if (!apiDisabled && remote && remote.length > 0) {
      for (const row of remote) {
        if (!row || typeof row.id !== 'string' || typeof row.q !== 'string') continue;
        const a = typeof row.a === 'string' ? row.a : '';
        renderTurn(row.id, row.q, a, false);
        addSidebarEntry(row.id, row.q);
      }
      saveHistory(
        remote.map((r) => ({
          id: r.id,
          q: r.q,
          a: r.a,
          t: typeof r.t === 'number' ? r.t : Date.now(),
        }))
      );
      setSyncStatus('server');
      return;
    }

    const entries = loadHistory();
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
        .catch(() => {
          setSyncStatus('warn');
        });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;

    const turnId = newTurnId();
    const answerText = answerFor(q);
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

    const entries = loadHistory();
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
  }

  const taglineEl = document.getElementById('gpt-tagline');
  if (taglineEl) {
    taglineEl.textContent = TAGLINE;
  }

  if (form && input && logEl) {
    void restoreHistory();
    form.addEventListener('submit', handleSubmit);
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
        .catch(() => {
          setSyncStatus('warn');
        });
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
