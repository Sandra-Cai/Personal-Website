document.documentElement.classList.add('js');

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

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

/** Skip / logo home: re-focus even when the hash does not change. */
function initLandmarkRefocus() {
  document.querySelectorAll('a[href="#top"], a[href="#main"]').forEach((a) => {
    a.addEventListener('click', () => {
      const id = (a.getAttribute('href') || '').replace(/^#/, '');
      if (!id) return;
      focusProgrammatic(document.getElementById(id));
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

  /** Section hash → focusable heading (SandraGPT focuses its own input). */
  const focusHeadingBySection = {
    work: 'accel-title',
    research: 'research-title',
    education: 'edu-title',
    beliefs: 'beliefs-title',
  };

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
    if (!id || id === 'sandra-gpt') return;
    let el = null;
    if (id === 'top') el = document.getElementById('top');
    else if (focusHeadingBySection[id]) el = document.getElementById(focusHeadingBySection[id]);
    if (!el) return;
    focusProgrammatic(el);
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
