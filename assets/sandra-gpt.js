/**
 * SandraGPT: answers from local notes (keyword + greeting rules).
 * Bot replies are plain text only (no URLs or links in the chat log).
 */
(function () {
  const EMAIL = 'sandraxcyj@gmail.com';
  /** Must match the SandraGPT subtitle on the page (set on load). */
  const TAGLINE = 'Work, school, internships, trading comps, research, or say hi.';

  const REPLY_INDEPENDENT_RESEARCH =
    "Outside my day jobs I do my own markets and quant research: long-form equity work (for example AeroVironment), open quant writeups (including the Jane Street India piece), a Bayes decision-making paper, AI and macro pieces on Medium, and competition work like Duke Fintech. The Research section on this page lists the main threads.";

  const KNOWLEDGE = [
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
      keys: ['four years', '4 years', 'experience', 'work experience', 'years of', 'internship', 'internships', 'career', 'track record', 'professional'],
      reply:
        "I have about four years of work experience across roles: industry and internships (e.g. quantitative research at Vigil Markets / Nuveaux), research labs (Microsoft Research Asia), engineering at scale (JD.com), founding work (Plurall AI), plus independent research and competitions. I am also a CS student at NYU in parallel (see the Academic section on this site).",
    },
    {
      keys: ['vigil', 'nuveaux', 'quantitative researcher', 'clearinghouse', 'counterparty', 'underwriting', 'crypto trading volume'],
      reply:
        "My most recent role was a Quantitative Researcher internship at Vigil Markets (Nuveaux Trading). I architected Python-based crypto trading volume analysis to reduce counterparty risk, cut underwriting cost per trade via assembly-level optimizations, and mapped risk analysis for an on-blockchain clearinghouse.",
    },
    {
      keys: ['microsoft research', 'msra', 'microsoft research asia'],
      reply:
        "At Microsoft Research Asia I did blockchain financial research, bridging protocol-level ideas with market and institutional questions.",
    },
    {
      keys: ['jd.com', 'jdcom', 'private cloud'],
      reply:
        "At JD.com I built private cloud infrastructure: a full-stack line from low-level systems up toward how applications run at scale.",
    },
    {
      keys: ['duke fintech', 'duke', 'fintech trading competition', 'scoreboard'],
      reply:
        "I am ranked #1 on the Duke Fintech Trading Competition scoreboard under their risk-adjusted / Sharpe-style rules. The live scoreboard is linked from the Research section on this page.",
    },
    {
      keys: ['phoenix', 'new york tech week', 'crypto strateg'],
      reply:
        "I won the Phoenix Trading Competition focused on crypto strategies during New York Tech Week in 2023.",
    },
    {
      keys: ['trade', 'trading', 'trader', 'paper trade'],
      reply:
        "I pursue markets seriously: Duke Fintech scoreboard, Phoenix Trading Competition (crypto, NY Tech Week 2023), plus equity and macro writing on LinkedIn and Medium (see this page for pointers).",
    },
    {
      keys: ['aerovironment', 'avav', 'equity pitch', 'pe-backed'],
      reply:
        "My AeroVironment (AVAV) investment thesis (12 months) is listed in the Research section on this page.",
    },
    {
      keys: ['jane street', 'india ban', 'sebi', 'microstructure', 'inside the ban'],
      reply:
        'I open-sourced "Inside the Ban: A Quantitative Autopsy of Jane Street\'s Trading Tactics in India," a forensic breakdown of the two-legged strategy and SEBI\'s July 2025 action. Announcement and repo details are on my LinkedIn (linked from this site).',
    },
    {
      keys: ['bayes', 'bayesian', 'decision-making', 'theorem of wisdom', 'urc'],
      reply:
        'White paper "Theorem of Wisdom: Bayes\' Theorem As the Most Rational Way of Making Decisions," open on GitHub; I announced it on LinkedIn. I also presented related Bayesian work at NYU URC to 1,000+ attendees.',
    },
    {
      keys: ['chip war', 'ai performance', 'supply chain', 'geopolitical', 'oscar', 'hawkish', 'dovish'],
      reply:
        "I have two Medium pieces on AI and macro; my Medium profile is linked from this page.",
    },
    {
      keys: ['medium', 'linkedin', 'macro', 'macroeconomic'],
      reply:
        "Longer research lives on LinkedIn (posts) and Medium, plus Substack @caisandra for essays. Links are in the header and strips on this page.",
    },
    {
      keys: ['school', 'nyu', 'major', 'minor', 'degree', 'bemet', 'bemt', 'mathematics minor'],
      reply:
        "I'm at NYU studying Computer Science with minors in Mathematics and BEMT (Business of Entertainment, Media and Technology). I'm focused on where rigorous financial analysis meets technology-driven execution.",
    },
    {
      keys: ['who', 'yourself', 'about you', 'introduce', 'background', 'who are you'],
      reply:
        "I'm Sandra Cai: roughly four years of professional work across quant crypto infra (Vigil Markets / Nuveaux), blockchain research (MSRA), cloud (JD.com), founding (Plurall AI), and independent markets research, plus CS at NYU (Math and BEMT minors) alongside that.",
    },
    {
      keys: ['plurall', 'deepfake', 'founder', 'startup'],
      reply:
        "Plurall AI is my deepfake-detection platform, part of my entrepreneurial engineering work alongside other builds documented on GitHub.",
    },
    {
      keys: ['pennapps', 'blockchain project', 'best blockchain'],
      reply:
        "At PennApps I shipped an AI and blockchain application that won Best Blockchain Project. Code and other engineering work are on my GitHub.",
    },
    {
      keys: ['github', 'code', 'engineering', 'build'],
      reply:
        "Engineering work (Plurall AI, the PennApps blockchain project, Jane Street India paper repo, Bayes paper repo, and more) lives on my GitHub (Sandra-Cai).",
    },
    {
      keys: ['passion', 'interest', 'focus', 'why finance'],
      reply:
        "I'm passionate about the intersection of rigorous financial analysis and technology-driven execution: from on-chain clearing and volume analytics to independent equity and macro research.",
    },
    {
      keys: ['substack', 'writing', 'essay'],
      reply:
        "I write on Substack (@caisandra) for essays and notes; deeper quant and macro threads on LinkedIn and Medium.",
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'collaborat'],
      reply: `${EMAIL} or LinkedIn. Include scope and links for roles or projects.`,
    },
    {
      keys: ['resume', 'cv', 'résumé'],
      reply: `I don't share my resume publicly online for privacy. For recruiting or collaboration: ${EMAIL} or LinkedIn.`,
    },
  ];

  const DEFAULT_REPLIES = [
    'Ask about something from the tagline above, or a topic from the page (work, research, school). I answer from short notes here.',
    `If you need a real conversation outside this box, write to ${EMAIL}.`,
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
      return `Hey! Ask something in the box when you are ready. If you want a real conversation outside this tool, write to ${EMAIL}.`;
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

    // Single-word or bare "research" (whole word only; "researcher" is different)
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
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
