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

  function answerFor(question) {
    const q = normalize(question);
    if (!q) return 'Type a question above.';

    if (greetingReply(q)) {
      return 'Hello. Ask a question whenever you are ready.';
    }

    if (/^(what is this|what's this)\??$/.test(q)) {
      return 'Short answers from notes on this site—not a live model. Ask about a topic from the tagline or something on the page.';
    }

    if (
      /\bwhat do you do for fun\b|\bfor fun\b|\bhobbies\b|\bwhat do you do in your (free|spare) time\b/.test(q)
    ) {
      return 'Reading, writing on markets and tech, and trading-style competitions when time allows.';
    }

    if (
      /\bwhat do you do\b|\bwhat's your job\b|\bwhat is your job\b|\bwhat is your role\b|\bwhat work do you do\b/.test(q)
    ) {
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

  const form = document.getElementById('gpt-form');
  const input = document.getElementById('gpt-input');
  const logEl = document.getElementById('gpt-log');

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `gpt-msg gpt-msg--${role}`;
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    logEl.appendChild(div);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    div.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendMsg('user', q);
    input.value = '';
    appendMsg('bot', answerFor(q));
  }

  const taglineEl = document.getElementById('gpt-tagline');
  if (taglineEl) {
    taglineEl.textContent = TAGLINE;
  }

  if (form && input && logEl) {
    form.addEventListener('submit', handleSubmit);
  }
})();
