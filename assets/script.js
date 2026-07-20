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

  if (typeof IntersectionObserver !== 'function') return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.6] }
  );

  for (const row of tracked) observer.observe(row.section);
}

initNavScrollSpy();
