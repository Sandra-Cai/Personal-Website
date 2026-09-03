/* cache-bust: 31 */
document.documentElement.classList.add('js');

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

const THEME_KEY = 'ba-theme';
const THEME_CYCLE = ['system', 'light', 'dark'];

function readStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* private mode */
  }
  return 'system';
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-theme', mode);
  } else {
    root.removeAttribute('data-theme');
  }
  const chrome = getComputedStyle(root).getPropertyValue('--theme-chrome').trim() || '#FFFDF7';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', chrome);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const label = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', `Color theme: ${label}. Click to change.`);
    btn.setAttribute('title', `Theme: ${label}`);
    const visible = btn.querySelector('.ba-theme-toggle-label');
    if (visible) visible.textContent = label;
  }
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  let mode = readStoredTheme();
  applyTheme(mode);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const idx = THEME_CYCLE.indexOf(mode);
    mode = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    try {
      if (mode === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* private mode */
    }
    applyTheme(mode);
  });
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readStoredTheme() === 'system') applyTheme('system');
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
  } catch {
    /* ignore */
  }
}

initThemeToggle();

/** Prefer a visible focus ring for programmatic focus (hash / skip). */
function focusProgrammatic(el) {
  if (!el) return;
  window.requestAnimationFrame(() => {
    try {
      el.focus({ preventScroll: true, focusVisible: true });
    } catch {
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
    }
  });
}

/** Section hash → focusable heading (SandraGPT focuses its input). */
const focusHeadingBySection = {
  work: 'accel-title',
  research: 'research-title',
  education: 'edu-title',
  beliefs: 'beliefs-title',
  perspective: 'split-title',
};

function focusSectionById(id) {
  if (!id) return;
  if (id === 'sandra-gpt') {
    focusProgrammatic(document.getElementById('gpt-input'));
    return;
  }
  if (id === 'top' || id === 'main') {
    focusProgrammatic(document.getElementById(id));
    return;
  }
  const headingId = focusHeadingBySection[id];
  if (headingId) focusProgrammatic(document.getElementById(headingId));
}

/** Re-focus even when the hash does not change (second click / skip). */
function initLandmarkRefocus() {
  const hrefs = [
    '#top',
    '#main',
    '#sandra-gpt',
    '#work',
    '#research',
    '#education',
    '#beliefs',
    '#perspective',
  ];
  const selector = hrefs.map((h) => `a[href="${h}"]`).join(', ');
  document.querySelectorAll(selector).forEach((a) => {
    a.addEventListener('click', () => {
      const id = (a.getAttribute('href') || '').replace(/^#/, '');
      focusSectionById(id);
    });
  });
}

/** Highlight in-page nav link for the section currently in view. */
function initNavScrollSpy() {
  const nav = document.querySelector('.ba-nav');
  if (!nav) return;

  const pairs = [
    ['#sandra-gpt', 'sandra-gpt'],
    ['#work', 'work'],
    ['#research', 'research'],
    ['#education', 'education'],
  ];

  const tracked = [];
  for (const [href, id] of pairs) {
    const link = nav.querySelector(`a[href="${href}"]`);
    const section = document.getElementById(id);
    if (link && section) tracked.push({ id, link, section });
  }
  if (!tracked.length) return;

  const clearActive = () => {
    for (const row of tracked) row.link.removeAttribute('aria-current');
  };

  const setActive = (id) => {
    for (const row of tracked) {
      if (row.id === id) row.link.setAttribute('aria-current', 'location');
      else row.link.removeAttribute('aria-current');
    }
  };

  const focusHashTarget = () => {
    const id = location.hash.replace(/^#/, '');
    if (!id) return;
    focusSectionById(id);
  };

  const applyHash = () => {
    const id = location.hash.replace(/^#/, '');
    if (id && tracked.some((r) => r.id === id)) setActive(id);
    else clearActive();
    focusHashTarget();
  };

  applyHash();

  // Hash navigation works with or without IntersectionObserver.
  window.addEventListener('hashchange', applyHash);

  let scrollTimer;
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        if (window.scrollY < 120 && !location.hash) clearActive();
      }, 80);
    },
    { passive: true }
  );

  // Sections without primary-nav links: clear aria-current when they take the viewport.
  const clearTargets = new Set();
  for (const id of ['beliefs', 'perspective']) {
    const el = document.getElementById(id);
    if (el) clearTargets.add(el);
  }
  const hero = document.querySelector('.ba-hero');
  if (hero) clearTargets.add(hero);
  const footer = document.querySelector('footer.ba-footer');
  if (footer) clearTargets.add(footer);

  let observer = null;
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const top = visible[0].target;
        if (tracked.some((r) => r.section === top)) setActive(top.id);
        else if (clearTargets.has(top)) clearActive();
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.6] }
    );

    for (const row of tracked) observer.observe(row.section);
    for (const el of clearTargets) observer.observe(el);
  }

  window.addEventListener('pagehide', (event) => {
    window.clearTimeout(scrollTimer);
    // Keep the observer alive when the page enters bfcache so Back restores spy.
    if (!event.persisted && observer) observer.disconnect();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) applyHash();
  });
}

initLandmarkRefocus();
initNavScrollSpy();

function focus404Title() {
  if (!document.querySelector('.ba-404')) return;
  focusProgrammatic(document.querySelector('.ba-404-title') || document.getElementById('main'));
}

focus404Title();
window.addEventListener('pageshow', (event) => {
  if (event.persisted) focus404Title();
});
