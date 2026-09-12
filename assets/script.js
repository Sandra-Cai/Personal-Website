/* cache-bust: 37 */
document.documentElement.classList.add('js');

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

const THEME_KEY = 'ba-theme';
const THEME_LIGHT = '#FFFDF7';
const THEME_DARK = '#141210';

function readStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* private mode */
  }
  return 'system';
}

function systemPrefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function syncThemeColorMetas(mode, effective) {
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (!metas.length) return;
  if (mode === 'light' || mode === 'dark') {
    const color = mode === 'dark' ? THEME_DARK : THEME_LIGHT;
    metas.forEach((meta) => meta.setAttribute('content', color));
    return;
  }
  metas.forEach((meta) => {
    const media = meta.getAttribute('media') || '';
    if (media.includes('dark')) meta.setAttribute('content', THEME_DARK);
    else if (media.includes('light')) meta.setAttribute('content', THEME_LIGHT);
    else meta.setAttribute('content', effective === 'dark' ? THEME_DARK : THEME_LIGHT);
  });
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-theme', mode);
  } else {
    root.removeAttribute('data-theme');
  }
  // Boot may set an inline color-scheme; clear so CSS tokens own the page.
  root.style.removeProperty('color-scheme');
  const effective = mode === 'dark' || (mode === 'system' && systemPrefersDark()) ? 'dark' : 'light';
  syncThemeColorMetas(mode, effective);
  const group = document.getElementById('theme-toggle');
  if (!group) return;
  group.setAttribute('data-theme-mode', mode);
  group.setAttribute('data-effective', effective);
  const label = mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark';
  group.setAttribute('aria-label', `Color theme: ${label}. Sun is light, moon is dark.`);
  group.querySelectorAll('.ba-theme-mark').forEach((mark) => {
    const choice = mark.getAttribute('data-theme-choice');
    const pressed = mode === choice;
    const name = choice === 'light' ? 'Light' : 'Dark';
    mark.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    mark.setAttribute('title', name);
    if (pressed) {
      mark.setAttribute('aria-label', `${name} theme, selected`);
    } else if (mode === 'system' && choice === effective) {
      mark.setAttribute('aria-label', `${name} theme, following system`);
    } else {
      mark.setAttribute('aria-label', `${name} theme`);
    }
  });
}

function persistTheme(mode) {
  try {
    if (mode === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* private mode */
  }
}

function initThemeToggle() {
  const group = document.getElementById('theme-toggle');
  let mode = readStoredTheme();
  applyTheme(mode);
  if (!group) return;
  const marks = Array.from(group.querySelectorAll('.ba-theme-mark'));
  const choose = (choice, toggleSystem) => {
    if (choice !== 'light' && choice !== 'dark') return;
    mode = toggleSystem && mode === choice ? 'system' : choice;
    persistTheme(mode);
    applyTheme(mode);
  };
  marks.forEach((mark, index) => {
    mark.addEventListener('click', () => {
      choose(mark.getAttribute('data-theme-choice'), true);
    });
    mark.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      let next = index;
      if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = marks.length - 1;
      else if (e.key === 'ArrowRight') next = Math.min(index + 1, marks.length - 1);
      else next = Math.max(index - 1, 0);
      const target = marks[next];
      if (!target) return;
      target.focus();
      choose(target.getAttribute('data-theme-choice'), false);
    });
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
  const syncFromStore = () => {
    mode = readStoredTheme();
    applyTheme(mode);
  };
  // Back/forward cache can restore an older theme-color or mark state.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) syncFromStore();
  });
  // Keep sun/moon marks in sync if another tab changes the theme.
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_KEY || (event.key === null && event.newValue === null)) {
      syncFromStore();
    }
  });
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
