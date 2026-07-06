/**
 * SandraGPT: answers from local notes (keyword + greeting rules).
 * Bot replies are plain text only (no URLs or links in the chat log).
 */
(function () {
  const EMAIL = 'sandraxcyj@gmail.com';
  /** Must match the SandraGPT subtitle on the page (set on load). */
  const TAGLINE = 'Plurall AI, work, research, trading comps, background, or say hi.';

  const REPLY_INDEPENDENT_RESEARCH =
    'Independent work spans equity research, macro and AI writing, open quant work, and synthetic-media trust (via Plurall AI). The Research section on this page lists pieces and links.';

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
        'Anything that fits the tagline—Plurall AI, work, research, trading, academic background—or a pointed question about a section or project on the page.',
    },
    {
      keys: [
        'personal research',
        'independent research',
        'your own research',
        'research do you',
        'research outside',
      ],
      priority: 12,
      reply: REPLY_INDEPENDENT_RESEARCH,
    },
    {
      keys: [
        'female founders fellowship',
        'female founders nyu',
        'nyu female founders',
        'nyu entrepreneurship',
        'venture equity program',
        'max stenbeck',
        'stenbeck venture',
      ],
      priority: 19,
      reply:
        'NYU Entrepreneurship publishes cohort rosters that name Sandra with Plurall AI (including Female Founders Fellowship cohorts and Venture Equity program listings); this site is still the abbreviated portfolio narrative.',
    },
    {
      keys: ['internship experience', 'summer internship', 'your internship', 'internships at'],
      priority: 22,
      reply:
        'Roles have included quantitative research (Vigil Markets / Nuveaux), research at Microsoft Research Asia, engineering at JD.com, and founding work (Plurall AI). Work and Research on this page have the fuller story.',
    },
    {
      keys: [
        'four years',
        '4 years',
        '4+ years',
        'four plus years',
        'your work experience',
        'years of work experience',
        'years of experience',
        'career path',
        'career background',
        'your career',
        'your track record',
      ],
      priority: 15,
      reply:
        '4+ years across quant and markets work, institutional research, large-scale engineering, founding, and independent research. NYU coursework is summarized under Academic as supporting detail—not the headline.',
    },
    {
      keys: [
        'accelerating work',
        'work that ships',
        'work section',
        'track record section',
        'research section',
        'professional experience section',
      ],
      priority: 26,
      reply:
        'Track record leads with Plurall AI (founding), then quant (Vigil Markets) and institutional research (MSRA, JD.com).',
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
        'Core focus areas are markets/quant, independent research, and AI/trust engineering (including Plurall AI for synthetic-media verification). This site highlights where those overlap.',
    },
    {
      keys: [
        'three things i believe',
        'things you believe',
        'what do you believe',
        'beliefs section',
        'show the work section',
      ],
      priority: 28,
      reply:
        'Three things on this page: Show the work (data, mechanism, falsifiability); Systems and incentives (microstructure, risk, infrastructure); Ship and iterate (research informs builds; public writing keeps both honest).',
    },
    {
      keys: ['rigor as infrastructure', 'perspective section', 'split section'],
      priority: 27,
      reply:
        'The perspective block—Rigor as infrastructure—means the same bar for clearinghouse models, synthetic-media checks, and stock pitches: defensible assumptions and engineering to test them.',
    },
    {
      keys: [
        'standard of proof',
        'one standard of proof',
        'academic rigor',
        'show the work belief',
        'trustworthy media',
        'ai-native world',
      ],
      priority: 34,
      reply:
        'One standard of proof—from Plurall AI (trustworthy media in a synthetic world) through markets, infrastructure, and public research. Same as Show the work on this page: claims need data, mechanism, and a clear way to be wrong.',
    },
    {
      keys: [
        'systems and incentives',
        'microstructure and risk',
        'microstructure and infrastructure',
      ],
      priority: 29,
      reply:
        'A core theme is systems and incentives: microstructure, risk, and infrastructure should be reasoned about with the same precision in research and in code.',
    },
    {
      keys: ['ship and iterate', 'shipping philosophy', 'your build philosophy', 'research informs builds'],
      priority: 24,
      reply:
        'Research should inform builds, and builds should stress-test research; public writing keeps that loop honest.',
    },
    {
      keys: ['institutional card', 'research & cloud', 'research and cloud', 'msra card'],
      priority: 28,
      reply:
        'The Institutional card is MSRA (blockchain finance research) and JD.com (private cloud)—third on Track record after Plurall AI and quant.',
    },
    {
      keys: [
        'founding card',
        'plurall card',
        'first card',
        'lead card',
        'markets systems trust',
        'one discipline',
      ],
      priority: 25,
      reply:
        'The connector line on this page—markets, systems, trust as one discipline—shows up across quant work, research, and Plurall AI (the lead Founding card on Track record).',
    },
    {
      keys: ['sandragpt', 'sandra gpt', 'this chat', 'this box'],
      priority: 32,
      reply:
        'SandraGPT is a lightweight on-page helper that matches your question to notes from this site; it is not a live LLM.',
    },
    {
      keys: [
        'press slash',
        'keyboard shortcut',
        'shortcut key',
        'focus shortcut',
        'slash key',
        'slash to focus',
      ],
      priority: 31,
      reply:
        'Press / anywhere on the page (outside a text field) to jump to SandraGPT and focus the question box.',
    },
    {
      keys: [
        'vigil markets',
        'nuveaux trading',
        'quantitative researcher',
        'clearinghouse risk',
        'on-chain clearinghouse',
        'counterparty risk',
        'underwriting cost',
        'crypto trading volume',
      ],
      priority: 40,
      reply:
        'At Vigil Markets (Nuveaux Trading), I focused on Python crypto volume analysis, counterparty risk, underwriting cost, assembly-level optimizations, and on-blockchain clearinghouse risk mapping.',
    },
    {
      keys: ['microsoft research', 'microsoft research asia', 'msra research', 'at msra'],
      priority: 40,
      reply: 'At Microsoft Research Asia, I worked on blockchain-finance research connecting protocol design to market and institutional questions.',
    },
    {
      keys: ['jd.com', 'jdcom', 'jd private cloud', 'private cloud at jd'],
      priority: 35,
      reply: 'At JD.com, I built private-cloud infrastructure from low-level systems work through application-scale concerns.',
    },
    {
      keys: ['duke fintech', 'fintech trading competition', 'duke scoreboard', 'fintech scoreboard', 'duke fintech scoreboard', 'fintechtradingcompetition', 'duke live scoreboard'],
      priority: 30,
      reply:
        'The site notes a #1 Duke Fintech Trading Competition result under risk-adjusted rules; the Research section links the live scoreboard.',
    },
    {
      keys: [
        'phoenix trading',
        'phoenix trading competition',
        'new york tech week',
        'new york tech week 2023',
        'crypto strateg',
        'crypto strategy',
        'crypto strategies',
      ],
      priority: 30,
      reply: 'The site notes a Phoenix Trading Competition win (crypto strategies) during New York Tech Week 2023.',
    },
    {
      keys: ['trading comp', 'trading comps', 'trade competition'],
      priority: 10,
      reply:
        'I take structured trading and markets work seriously—competitions, research writing, and related projects. Work and Research on this page point to specifics.',
    },
    {
      keys: ['quantitative finance', 'quant finance', 'your quant research', 'quant work at vigil', 'quant role'],
      priority: 18,
      reply:
        'Quant-style work shows up at Vigil/Nuveaux, in trading competitions, and in independent research. Work and Research on this page cover each thread.',
    },
    {
      keys: ['aerovironment', 'avav', 'avav thesis', 'equity pitch avav', 'your equity pitch', 'avav perplexity', 'perplexity avav'],
      priority: 35,
      reply: 'The AeroVironment (AVAV) thesis is listed under Research on this page.',
    },
    {
      keys: ['perplexity thesis', 'read on perplexity', 'avav on perplexity', 'perplexity avav thesis'],
      priority: 32,
      reply: 'The AVAV investment thesis is linked from Research on this page (Perplexity).',
    },
    {
      keys: ['jane street india', 'inside the ban', 'jane street india ban', 'jane street microstructure', 'jane-street-india-ban', 'sebi enforcement', 'sebi india'],
      priority: 45,
      reply:
        'The Research section links “Inside the Ban: A Quantitative Autopsy of Jane Street’s Trading Tactics in India” (July 2025; open repo Jane-Street-India-Ban-Analysis on GitHub; announcement on LinkedIn).',
    },
    {
      keys: [
        'theorem of wisdom',
        'bayes theorem',
        'bayes-theorem',
        'bayesian decision',
        'bayesian reasoning',
        'nyu urc',
        'urc presentation',
      ],
      priority: 35,
      reply:
        'The site lists “Theorem of Wisdom” (Bayesian decision-making) in the Bayes-Theorem repo on GitHub and notes related work presented at NYU URC (1,000+ attendees).',
    },
    {
      keys: [
        'chip war medium',
        'ai performance medium',
        'supply chain macro',
        'geopolitical macro',
        'oscar medium',
        'oscar should be given',
        'hawkish vs dovish',
      ],
      priority: 12,
      reply: 'I have Medium pieces on AI and macro themes; the profile is linked from this page.',
    },
    {
      keys: [
        'your medium articles',
        'medium profile',
      ],
      priority: 8,
      reply: 'Longer threads are on LinkedIn and Medium; Substack is @caisandra. Links are in the header and social strips.',
    },
    {
      keys: ['your medium handle', 'medium handle', 'caisandra medium', '@caisandra medium'],
      priority: 13,
      reply: 'Medium profile is @caisandra—linked from the Writing strip, Research deck, and footer on this page.',
    },
    {
      keys: ['yijia sandra cai', 'which linkedin', 'linkedin handle', 'wrong sandra cai'],
      priority: 17,
      reply:
        'For this site, the LinkedIn profile is Yijia Sandra Cai (shown in the Writing section). SandraGPT answers are based on this site content, not other people with similar names.',
    },
    {
      keys: ['your linkedin', 'linkedin profile', 'linkedin url', 'linkedin link'],
      priority: 14,
      reply:
        'LinkedIn profile is Yijia Sandra Cai—linked from the Writing strip, Research deck, and footer on this page.',
    },
    {
      keys: [
        'which school',
        'what school',
        'your school',
        'which college',
        'which university',
        'your college',
        'your university',
        'when do you graduate',
        'year do you graduate',
        'nyu cs',
        'at nyu',
        'go to nyu',
        'study at nyu',
        'nyu student',
        'academic section',
        'your major',
        'cs major',
        'computer science major',
        'your degree',
        'bemet',
        'bemt',
        'mathematics minor',
        'math minor',
        'bemt minor',
      ],
      priority: 25,
      reply:
        'NYU Computer Science with minors in Mathematics and BEMT—coursework under Academic; operating experience leads on this page.',
    },
    {
      keys: [
        'coursework',
        'what classes',
        'classes do you',
        'courses you take',
        'studying what',
        'nlp class',
        'nlp course',
        'nlp coursework',
        'operating systems class',
        'operating systems course',
        'computer security',
        'deep learning class',
        'software engineering class',
      ],
      priority: 14,
      reply:
        'The Academic section summarizes NYU coursework (algorithms through ML, NLP, systems, and security) in factual terms.',
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
        'introduce yourself',
        'your background',
      ],
      priority: 20,
      reply:
        'Sandra Cai—founding Plurall AI for enterprise deepfake detection, with 4+ years across quant markets, institutional research, and systems engineering. Work and Research on this page; NYU coursework under Academic.',
    },
    {
      keys: [
        'what is your name',
        "what's your name",
        'what is ur name',
        'whats your name',
        'your full name',
        'what should i call you',
      ],
      priority: 24,
      reply: 'Sandra Cai. Work, Academic, and Research on this page cover projects and credential detail.',
    },
    {
      keys: [
        'where are you',
        'where do you live',
        'where are you based',
        'based in new york',
        'which city',
        'your location',
        'where located',
      ],
      priority: 18,
      reply:
        'New York—NYU coursework is summarized under Academic; the site emphasizes operating experience first.',
    },
    {
      keys: [
        'are you open to work',
        'open to work opportunities',
        'open to new roles',
        'your availability',
        'recruiter outreach',
        'hiring recruiter',
        'are you hiring',
        'recruiting role',
      ],
      priority: 16,
      reply: `For recruiting or collaboration, reach out at ${EMAIL} or LinkedIn with role scope, timeline, and context.`,
    },
    {
      keys: [
        'visa sponsorship',
        'work sponsorship',
        'need sponsorship',
        'work authorization',
        'work auth',
        'willing to relocate',
        'open to relocation',
        'open to remote work',
        'remote work preference',
        'remote role',
        'hybrid role',
        'in office role',
        'on site role',
        'your rate',
        'your rates',
        'hourly rate',
        'consulting rate',
        'consulting fee',
        'your pricing',
        'salary range',
        'compensation package',
      ],
      priority: 13,
      reply: `Logistics like visa, location, and compensation are best discussed directly—email ${EMAIL} or LinkedIn with role scope and timeline and we can take it from there.`,
    },
    {
      keys: [
        "what's new with plurall",
        'whats new at plurall',
        "what's the latest with plurall",
        'whats the latest at plurall',
        'any updates on plurall',
        'recent work at plurall',
      ],
      priority: 11,
      reply:
        'Plurall AI traction (enterprise customers, LOI, B2B pipeline) plus independent research—see Research, Substack (@caisandra), and LinkedIn for the latest threads.',
    },
    {
      keys: [
        'plurall',
        'plurall ai',
        'deepfake detection',
        'deepfake company',
        'deep fake detection',
        'synthetic media trust',
        'deepfake startup',
        'are you a founder',
        'founder of plurall',
        'your startup',
        'what startup',
        'what are you founding',
        'what are you building',
        'what do you found',
        'what did you found',
      ],
      priority: 42,
      reply:
        'Plurall AI is a deepfake-detection company building a proprietary multimodal system from first principles—sub-two-second inference at high accuracy, designed for enterprise deployment as a trust layer for an increasingly synthetic world. The Founding card on this page links GitHub.',
    },
    {
      keys: [
        'how does plurall',
        'how plurall works',
        'how does plurall detect',
        'plurall multimodal',
        'plurall multimodal detection',
        'plurall detection model',
        'plurall detection accuracy',
        'plurall detection speed',
        'sub-two-second',
        'built from first principles',
        'plurall first principles',
        'proprietary detection model',
        'plurall proprietary model',
        'plurall tech',
        'plurall stack',
      ],
      priority: 38,
      reply:
        'Plurall AI runs a proprietary multimodal detection system built from first principles (not a wrapper on existing models)—sub-two-second inference at high accuracy, tuned for enterprise and real-world deployment where speed and reliability matter.',
    },
    {
      keys: [
        'plurall enterprise customer',
        'first enterprise customer',
        'plurall enterprise customers',
        'plurall b2b leads',
        'plurall letter of intent',
        'plurall paying customer',
        'paying enterprise customer',
        'plurall traction',
        'plurall customers',
        'plurall pipeline',
        'plurall loi',
      ],
      priority: 37,
      reply:
        'Plurall AI has secured its first enterprise customer, signed a letter of intent with another, and built a pipeline of 100+ B2B leads alongside organic consumer interest.',
    },
    {
      keys: [
        'acquisition offer',
        'buyout offer',
        'exit offer',
        'sell the company',
        'sell plurall',
        'seven figure',
        'seven-figure',
        'turn down offer',
        'turned down offer',
        'declined offer',
        'offer to buy',
        'offer to acquire',
      ],
      priority: 36,
      reply:
        'Plurall AI received and declined a seven-figure acquisition offer early on. The intent is to build the foundational standard for digital trust at scale, not a fast exit.',
    },
    {
      keys: [
        'techcrunch',
        'tech crunch',
        'startup battlefield',
        'techcrunch top 32',
        'enterprise tech startups',
      ],
      priority: 36,
      reply:
        'Plurall AI was named by TechCrunch as one of the Top 32 Enterprise Tech Startups at Startup Battlefield.',
    },
    {
      keys: [
        'nvidia partner',
        'ibm partner',
        'aws partner',
        'plurall partners',
        'plurall partnerships',
        'partner ecosystem',
        'who backs plurall',
        'who supports plurall',
        'backed by nvidia',
        'backed by ibm',
        'backed by aws',
      ],
      priority: 35,
      reply:
        "Plurall AI is backed by partners across NVIDIA, IBM, AWS, and NYU's entrepreneurial ecosystem.",
    },
    {
      keys: [
        'plurall trust layer',
        'digital trust layer',
        'plurall digital trust',
        'why deepfake',
        'why deepfakes',
        'why plurall matters',
        'why this problem matters',
        'plurall mission',
        'plurall vision',
        'plurall thesis',
      ],
      priority: 34,
      reply:
        'The thesis: synthetic media is a structural threat to trust, not a novelty. Plurall AI is building the trust layer that determines whether the broader AI ecosystem can function—reliable verification for enterprises and individuals as fraud attempts scale and human judgment falls short.',
    },
    {
      keys: [
        'which sandra cai',
        'wrong sandra',
        'different sandra cai',
        'multiple sandra cai',
        'are you the recruiter',
        'are you in guangzhou',
        'tc group logistics',
      ],
      priority: 33,
      reply:
        'SandraGPT refers to the profile on this site: Sandra (Yijia) Cai, with NYU summarized under Academic and links here to LinkedIn, GitHub, Medium, and Substack.',
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
      keys: ['pennapps', 'pennapps blockchain', 'best blockchain'],
      priority: 25,
      reply: 'At PennApps I shipped an AI + blockchain app that won Best Blockchain Project; code is on GitHub.',
    },
    {
      keys: [
        'your skills',
        'what skills',
        'tech stack',
        'languages do you',
        'what languages',
        'programming languages',
        'languages do you know',
        'python experience',
        'know python',
        'use python',
        'typescript experience',
        'know typescript',
        'your machine learning',
        'machine learning work',
      ],
      priority: 15,
      reply:
        'Python is central to quant and research work (e.g. Vigil/Nuveaux); ML and full-stack work show up in projects listed under Work and GitHub on this page.',
    },
    {
      keys: [
        'your github',
        'your github profile',
        'your github repos',
        'your github username',
        'github username',
        'your repos',
        'bayes-theorem repo',
        'jane-street-india-ban',
      ],
      priority: 8,
      reply:
        'Repos (papers, projects, tooling) are under Sandra-Cai on GitHub—including Bayes-Theorem and Jane-Street-India-Ban-Analysis linked from Research.',
    },
    {
      keys: ['github handle', 'sandra-cai github', 'github.com/sandra-cai', 'your github handle'],
      priority: 13,
      reply: 'GitHub profile is Sandra-Cai—linked from the header nav, Code strip, founding card, and footer on this page.',
    },
    {
      keys: ['what projects', 'side project', 'work portfolio', 'pet project'],
      priority: 12,
      reply: 'Highlighted work is under Work and Research; code and papers are linked from GitHub (Sandra-Cai).',
    },
    {
      keys: ['your passion', 'what are you passionate', 'areas of interest', 'why finance', 'why markets'],
      priority: 5,
      reply: 'I focus on where careful financial analysis meets solid engineering—in markets, research, and product.',
    },
    {
      keys: ['your writing', 'essays on substack', 'substack essays', 'where do you write', 'what substack', 'substack handle'],
      priority: 5,
      reply: 'Essays on Substack (@caisandra); quant and macro threads also on LinkedIn and Medium.',
    },
    {
      keys: ['your substack', 'substack profile', 'substack link', 'caisandra substack'],
      priority: 14,
      reply: 'Substack is @caisandra—linked from the header Writing nav, external links strip, and footer on this page.',
    },
    {
      keys: ['your email address', 'email address', 'what is your email', 'gmail address', 'sandraxcyj@gmail.com'],
      priority: 16,
      reply: `${EMAIL} or LinkedIn. Please include scope and relevant links.`,
    },
    {
      keys: [
        'contact you',
        'contact info',
        'email me',
        'your email',
        'reach you',
        'reach out to you',
        'how to reach out',
        'want to reach out',
        'get in touch with you',
        'collaborate with you',
        'collaboration request',
        'collaborating with you',
        'ping you',
        'can i ping you',
        'how to contact',
      ],
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
    'Plurall AI traction',
    'Plurall AI partners',
    'Plurall AI multimodal detection',
    'Vigil Markets / Nuveaux',
    'Microsoft Research Asia',
    'JD.com private cloud',
    'Duke Fintech competition',
    'Phoenix trading competition',
    'AeroVironment thesis',
    'Jane Street India ban autopsy',
    'Theorem of Wisdom / Bayes',
    'NYU founder programs',
    'NYU coursework',
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

    if (scored.length >= 3) return scored;
    if (scored.length > 0) {
      const start = topicStartIndexFor(q);
      const extra = [];
      for (let i = 0; i < SUGGESTED_TOPICS.length && scored.length + extra.length < 3; i++) {
        const topic = SUGGESTED_TOPICS[(start + i) % SUGGESTED_TOPICS.length];
        if (!scored.includes(topic) && !extra.includes(topic)) extra.push(topic);
      }
      return scored.concat(extra);
    }
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
      /\bwhat are you working on( these days| right now| now| currently)?\b/.test(q) ||
      /\bwhat are you up to\b/.test(q) ||
      /\bwhat are u up to\b/.test(q) ||
      /\bwhat'?s? on your plate\b/.test(q) ||
      /\bday job\b/.test(q) ||
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
      return 'Doing well, thanks for asking. Ask about work, research, trading competitions, academic notes, or anything specific on this page.';
    }

    if (/^(what is this|what's this)\??$/.test(q)) {
      return 'Short answers from notes on this site - not a live language model. Ask about a topic from the tagline or anything listed on the page.';
    }

    if (
      /\bwhat do you do for fun\b|\bhobbies\b|\bwhat do you do in your (free|spare) time\b/.test(q)
    ) {
      return 'Reading, writing about markets and tech, and joining trading-style competitions when time allows.';
    }

    // "What do you do?" — include common typos (e.g. dp for do) and casual phrasing; not a live model so no spellcheck
    if (looksLikeWhatDoYouDo(q)) {
      return 'Building Plurall AI, a deepfake-detection company shipping a proprietary multimodal system for enterprise (sub-two-second inference, built from first principles). Earlier work spans quant research, markets, and systems engineering; Work and Research lead, with NYU coursework as supporting depth.';
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

    if (
      (/\b(independent|personal|your) research\b/.test(q) ||
        /\btype of research\b/.test(q) ||
        /^\s*research\s*\??$/.test(q)) &&
      !/\bresearcher\b/.test(q)
    ) {
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
  /** When true, wipes local session and history on every full page load (fresh demo). */
  const RESET_HISTORY_ON_LOAD = false;

  const form = document.getElementById('gpt-form');
  const input = document.getElementById('gpt-input');
  const logEl = document.getElementById('gpt-log');
  const sidebarList = document.getElementById('gpt-sidebar-list');
  const clearBtn = document.getElementById('gpt-clear-history');
  const syncStatusEl = document.getElementById('gpt-sync-status');
  let submitBusy = false;
  let lastSubmittedCanonical = '';
  let lastSubmittedAt = 0;
  // Hoisted so handleSubmit can reset recall after a submission (programmatic
  // input.value = '' does not fire the input event that would otherwise reset it).
  let recallIndex = -1;
  let draftBeforeRecall = '';

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
      if (detail === 'rate') {
        syncStatusEl.textContent = 'Server busy; saved in browser only';
      } else if (detail === 'partial') {
        syncStatusEl.textContent = 'Partially synced; retrying later';
      } else {
        syncStatusEl.textContent = 'Couldn’t sync; saved in browser only';
      }
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

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }

  /** Prefill from ?q= (e.g. shared links to sandracai.com/?q=Plurall+AI) and submit. */
  function applyDeepLinkQuestion() {
    if (!input) return false;
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (!q) return false;
      const trimmed = q.trim().slice(0, MAX_QUESTION_CHARS);
      if (!trimmed) return false;
      input.value = trimmed;
      const section = document.getElementById('sandra-gpt');
      if (section) {
        section.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
      params.delete('q');
      const rest = params.toString();
      const nextUrl = window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash;
      window.history.replaceState(null, '', nextUrl);
      updateCharCount();
      updateSendState();
      if (form) form.requestSubmit();
      return true;
    } catch {
      return false;
    }
  }

  function focusSandraGptFromHash() {
    if (location.hash !== '#sandra-gpt' || !input) return;
    window.requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
    });
  }

  function updateStartersVisibility() {
    const starters = document.querySelector('.gpt-starters');
    if (!starters) return;
    starters.hidden = Boolean(logEl && logEl.children.length > 0);
  }

  function updateSendState() {
    const sendBtn = form?.querySelector('.gpt-send');
    if (!sendBtn || !input) return;
    const busy = form?.getAttribute('aria-busy') === 'true';
    const hasText = Boolean(input.value.trim());
    sendBtn.disabled = busy || !hasText;
    sendBtn.setAttribute(
      'aria-label',
      hasText && !busy ? 'Send question' : 'Enter a question to send'
    );
  }

  function updateCharCount() {
    const el = document.getElementById('gpt-char-count');
    if (!el || !input) return;
    const left = MAX_QUESTION_CHARS - input.value.length;
    if (left <= 40) {
      el.textContent = `${left} characters left`;
      el.classList.remove('visually-hidden');
    } else {
      el.textContent = '';
      el.classList.add('visually-hidden');
    }
  }

  function initStarterPrompts() {
    document.querySelectorAll('.gpt-starter[data-q]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-q');
        if (!q || !input || !form) return;
        input.value = q.slice(0, MAX_QUESTION_CHARS);
        recallIndex = -1;
        draftBeforeRecall = '';
        updateCharCount();
        updateSendState();
        form.requestSubmit();
      });
    });
  }

  function scrollToTurn(turnId) {
    const el = document.getElementById(`gpt-turn-${turnId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function renderTurn(turnId, q, answerText, doScroll) {
    const wrap = document.createElement('section');
    wrap.className = 'gpt-turn';
    wrap.id = `gpt-turn-${turnId}`;
    wrap.setAttribute('aria-label', 'Question and reply');

    const userDiv = document.createElement('div');
    userDiv.className = 'gpt-msg gpt-msg--user';
    userDiv.setAttribute('role', 'group');
    userDiv.setAttribute('aria-label', 'You asked');
    const pu = document.createElement('p');
    pu.textContent = q;
    userDiv.appendChild(pu);

    const botDiv = document.createElement('div');
    botDiv.className = 'gpt-msg gpt-msg--bot';
    botDiv.setAttribute('role', 'group');
    botDiv.setAttribute('aria-label', 'SandraGPT replied');
    const pb = document.createElement('p');
    pb.textContent = answerText;
    botDiv.appendChild(pb);

    wrap.appendChild(userDiv);
    wrap.appendChild(botDiv);
    logEl.appendChild(wrap);

    if (doScroll !== false) {
      wrap.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    }
    updateStartersVisibility();
  }

  function setSidebarItemActive(turnId) {
    if (!sidebarList) return;
    sidebarList.querySelectorAll('.gpt-sidebar-item').forEach((n) => {
      const isMatch = n.dataset.turnId === turnId;
      n.classList.toggle('gpt-sidebar-item--active', isMatch);
      if (isMatch) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    });
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
    btn.addEventListener('click', () => {
      setSidebarItemActive(turnId);
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
        'Clear this session’s questions and answers from this browser (and from the server, if database sync is on)?'
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
    recallIndex = -1;
    draftBeforeRecall = '';
    lastSubmittedCanonical = '';
    lastSubmittedAt = 0;
    updateStartersVisibility();
    const clearedOnServer = await clearRemote(getOrCreateSessionId());
    setSyncStatus(clearedOnServer ? 'server' : 'local');
    if (input) {
      input.focus();
      updateSendState();
    }
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
      updateStartersVisibility();
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
    updateStartersVisibility();
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
      lastSubmittedCanonical = canonicalQ;
      lastSubmittedAt = now;
      renderTurn(turnId, q, msg);
      addSidebarEntry(turnId, q);
      input.value = '';
      recallIndex = -1;
      draftBeforeRecall = '';
      updateCharCount();
      updateSendState();
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
    recallIndex = -1;
    draftBeforeRecall = '';
    updateCharCount();
    updateSendState();

    if (form) {
      const sendBtn = form.querySelector('.gpt-send');
      form.setAttribute('aria-busy', 'true');
      if (sendBtn) sendBtn.disabled = true;
      window.setTimeout(() => {
        form.setAttribute('aria-busy', 'false');
        updateSendState();
      }, 180);
    }

    renderTurn(turnId, q, answerText);
    addSidebarEntry(turnId, q);
    setSidebarItemActive(turnId);
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
    void restoreHistory().then(() => {
      if (!applyDeepLinkQuestion()) focusSandraGptFromHash();
    });
    initStarterPrompts();
    form.addEventListener('submit', handleSubmit);
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
          updateCharCount();
          updateSendState();
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
        updateCharCount();
        updateSendState();
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
      updateCharCount();
      updateSendState();
    });
    updateSendState();
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

  function isTypingInField(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    return el.isContentEditable;
  }

  const agentSection = document.getElementById('sandra-gpt');
  if (agentSection && input) {
    agentSection.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.activeElement !== input) return;
      e.preventDefault();
      input.blur();
    });
  }

  if (input) {
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingInField(document.activeElement)) return;
      e.preventDefault();
      if (agentSection) {
        agentSection.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
      input.focus();
    });
  }
})();
