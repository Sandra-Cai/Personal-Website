/**
 * SandraGPT: answers from local notes (keyword + greeting rules).
 * Bot replies linkify https:// and mailto: URLs.
 */
(function () {
  const EMAIL = 'sandraxcyj@gmail.com';

  const LINKS = {
    avav: 'https://www.perplexity.ai/computer/a/avav-investment-thesis-aerovir-GMIeCIF9SFiwIvgsL9DZAA',
    janeStreet: 'https://www.linkedin.com/posts/yijia-sandra-cai_quantfinance-derivatives-marketmicrostructure-activity-7439474320273276929-iD9X/',
    bayes: 'https://www.linkedin.com/posts/yijia-sandra-cai_bayesian-decisionmaking-opensource-activity-7439051968083300352--K94',
    medium: 'https://medium.com/@caisandra',
    mediumAi1: 'https://medium.com/@caisandra/oscar-should-be-given-to-ai-b3821f3bfc91',
    mediumAi2: 'https://medium.com/@caisandra/hawkish-v-s-dovish-its-the-ones-you-can-t-see-you-need-to-worry-about-8f90740bda65',
    dukeScoreboard: 'https://fintechtradingcompetition.com/articles/scoreboard.html',
    mailto: `mailto:${EMAIL}`,
  };

  const KNOWLEDGE = [
    {
      keys: ['four years', '4 years', 'experience', 'work experience', 'years of', 'intern', 'internship', 'career', 'track record', 'professional'],
      reply:
        "I have about four years of working experience across roles: industry and internships (e.g. quantitative research at Vigil Markets / Nuveaux), research labs (Microsoft Research Asia), engineering at scale (JD.com), founding work (Plurall AI), plus independent research and competitions. I am also a CS student at NYU in parallel (see the Academic section on this site).",
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
      reply: `I'm ranked #1 on the Duke Fintech Trading Competition scoreboard (risk-adjusted / Sharpe-style rules). Live rankings: ${LINKS.dukeScoreboard}`,
    },
    {
      keys: ['phoenix', 'new york tech week', 'crypto strateg'],
      reply:
        "I won the Phoenix Trading Competition focused on crypto strategies during New York Tech Week in 2023.",
    },
    {
      keys: ['trade', 'trading', 'trader', 'paper trade'],
      reply: `I pursue markets seriously. Duke Fintech scoreboard: ${LINKS.dukeScoreboard}. Phoenix Trading Competition winner (crypto, NY Tech Week 2023). Equity and macro writing: LinkedIn and Medium (${LINKS.medium}).`,
    },
    {
      keys: ['aerovironment', 'avav', 'equity pitch', 'pe-backed'],
      reply: `My AeroVironment (AVAV) investment thesis (12-month): ${LINKS.avav}`,
    },
    {
      keys: ['jane street', 'india ban', 'sebi', 'microstructure', 'inside the ban'],
      reply: `I open-sourced "Inside the Ban: A Quantitative Autopsy of Jane Street's Trading Tactics in India," a forensic breakdown of the two-legged strategy and SEBI's July 2025 action. Announcement and repo pointer: ${LINKS.janeStreet}`,
    },
    {
      keys: ['bayes', 'bayesian', 'decision-making', 'theorem of wisdom', 'urc'],
      reply: `White paper "Theorem of Wisdom: Bayes' Theorem As the Most Rational Way of Making Decisions," open on GitHub; I announced it here: ${LINKS.bayes}. I also presented related Bayesian work at NYU URC to 1,000+ attendees.`,
    },
    {
      keys: ['chip war', 'ai performance', 'supply chain', 'geopolitical', 'oscar', 'hawkish', 'dovish'],
      reply: `Two Medium pieces on AI and macro: ${LINKS.mediumAi1} and ${LINKS.mediumAi2}. Profile: ${LINKS.medium}`,
    },
    {
      keys: ['medium', 'linkedin', 'macro', 'macroeconomic'],
      reply: `Longer research: LinkedIn (posts) and Medium ${LINKS.medium}, plus Substack @caisandra for essays.`,
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
      keys: ['contact', 'email', 'reach', 'hire', 'collaborat', 'internship'],
      reply: `Email me at ${EMAIL}, or message me on LinkedIn. Include scope and links for roles or projects.`,
    },
    {
      keys: ['resume', 'cv', 'résumé'],
      reply: `I don't share my resume publicly online for privacy. For recruiting or collaboration, email ${EMAIL} or message me on LinkedIn.",
    },
  ];

  const DEFAULT_REPLIES = [
    `Try NYU, Vigil/MSRA/JD, Duke scoreboard, AVAV thesis, Jane Street India paper, Bayes paper, Medium, Plurall AI, or GitHub, or email ${EMAIL}.`,
    `Ask about quant work, open-source research, trading comps, or how to reach me: ${EMAIL}.`,
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
      return `Hey, I'm Sandra. I've got ~4 years across quant roles, labs, and founding; ask about that, Vigil Markets, MSRA, JD.com, Duke (${LINKS.dukeScoreboard}), research, Plurall AI, or GitHub, or email ${EMAIL}.`;
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

    const words = q.split(/\W+/).filter((w) => w.length > 2);
    for (const row of KNOWLEDGE) {
      for (const key of row.keys) {
        const parts = key.split(/\s+/);
        for (const w of words) {
          if (parts.some((p) => p.startsWith(w) || w.startsWith(p))) {
            return row.reply;
          }
        }
      }
    }

    return DEFAULT_REPLIES[Math.floor(Math.random() * DEFAULT_REPLIES.length)];
  }

  function appendParagraphWithLinks(container, text) {
    const p = document.createElement('p');
    const urlRe = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|mailto:[^\s<]+[^<.,:;"')\]\s])/g;
    let last = 0;
    let m;
    while ((m = urlRe.exec(text)) !== null) {
      if (m.index > last) {
        p.appendChild(document.createTextNode(text.slice(last, m.index)));
      }
      const href = m[1];
      const a = document.createElement('a');
      a.href = href;
      if (href.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.textContent = href;
      p.appendChild(a);
      last = m.index + m[1].length;
    }
    if (last < text.length) {
      p.appendChild(document.createTextNode(text.slice(last)));
    }
    container.appendChild(p);
  }

  const form = document.getElementById('gpt-form');
  const input = document.getElementById('gpt-input');
  const logEl = document.getElementById('gpt-log');

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `gpt-msg gpt-msg--${role}`;
    const hasLink = /https?:\/\/|mailto:/.test(text);
    if (role === 'bot' && hasLink) {
      appendParagraphWithLinks(div, text);
    } else {
      const p = document.createElement('p');
      p.textContent = text;
      div.appendChild(p);
    }
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

  if (form && input && logEl) {
    form.addEventListener('submit', handleSubmit);
  }
})();
