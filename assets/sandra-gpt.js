/**
 * Sandra GPT — answers from local "notes" (keyword matching).
 * Swap in an API call later if you add a backend.
 */
(function () {
  const KNOWLEDGE = [
    {
      keys: ['who', 'yourself', 'about you', 'introduce', 'background', 'who are you'],
      reply:
        "I'm Sandra Cai. I'm a junior at NYU studying Computer Science with a minor in Business Studies. I care about AI integrity, security engineering, and products that ship. I'm also the founder of Plurall AI (deepfake detection and related tooling).",
    },
    {
      keys: ['school', 'nyu', 'study', 'degree', 'major', 'minor', 'college', 'university'],
      reply:
        "I study Computer Science at NYU with a minor in Business Studies. Coursework spans algorithms, ML, deep learning, NLP, operating systems, software engineering, and computer security.",
    },
    {
      keys: ['plurall', 'deepfake', 'startup', 'founder', 'company', 'product'],
      reply:
        "Plurall AI is my company focused on deepfake detection and synthetic-media tooling — evaluation harnesses, inference APIs, and shipping for real customers. I'm building next-generation anti-deepfake and integrity tech.",
    },
    {
      keys: ['security', 'point72', 'intern', 'appsec', 'detection engineering', 'sigma', 'elastic'],
      reply:
        "I've done security-focused work including Point72-oriented prep: appsec and detection engineering labs, log pipelines, Sigma-style rules, Elastic, and writing up attack chains and defenses.",
    },
    {
      keys: ['project', 'work', 'build', 'github', 'code'],
      reply:
        "Highlights: Plurall AI (PyTorch, FastAPI, Python), security labs (Python, Sigma, Elastic), and AI video ad work (prompting, scripts, iteration for conversion). Code and activity are on my GitHub.",
    },
    {
      keys: ['skill', 'stack', 'python', 'typescript', 'language', 'tech'],
      reply:
        "I work most in Python, PyTorch, TypeScript/JavaScript, SQL, and C/C++. For shipping: FastAPI, Git, and security tooling like Elastic and Sigma. LaTeX when writing has to look sharp.",
    },
    {
      keys: ['write', 'writing', 'substack', 'essay', 'blog'],
      reply:
        "I write on Substack (@caisandra) — essays and notes on business, markets, AI, and language (e.g. follow-the-sun collaboration, quant/markets topics, bilingual cognition).",
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'collaborat', 'internship', 'job', 'opportunity'],
      reply:
        "Best way to reach me is email: hello@sandracai.com. I'm open to internships and collaborations — include scope, timeline, and links. I'm also on LinkedIn and GitHub from this page.",
    },
    {
      keys: ['hobby', 'dance', 'ski', 'film', 'euc', 'food', 'outside', 'fun'],
      reply:
        "Outside CS: I dance, ride EUC, ski, make films, act, and explore food in NYC. I also care about sharing what I've learned from my education openly.",
    },
    {
      keys: ['resume', 'cv', 'résumé'],
      reply: "Download my résumé from the Résumé link in the header (PDF on this site).",
    },
    {
      keys: ['education', 'learn', 'teach', 'share', 'private school'],
      reply:
        "I grew up in private schools and I want to share what I've learned — and how I learned — openly. That's part of why I write and build in public.",
    },
  ];

  const DEFAULT_REPLIES = [
    "I don't have a specific note for that. Try asking about NYU, Plurall AI, security work, writing on Substack, skills, or how to reach me — or email hello@sandracai.com.",
    "Not sure I covered that in my notes. Ask about school, projects, Plurall AI, security, Substack, or hobbies — or email me for a real conversation.",
  ];

  function normalize(s) {
    return s.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  function answerFor(question) {
    const q = normalize(question);
    if (!q) return "Type a question above.";

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

    /* Light fuzzy: word overlap */
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
    const a = answerFor(q);
    appendMsg('bot', a);
  }

  if (form && input && logEl) {
    form.addEventListener('submit', handleSubmit);
  }
})();
