document.documentElement.classList.add('js');

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

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

  const applyHash = () => {
    const id = location.hash.replace(/^#/, '');
    if (id && tracked.some((r) => r.id === id)) setActive(id);
    else if (!id && window.scrollY < 120) clearActive();
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

initNavScrollSpy();
