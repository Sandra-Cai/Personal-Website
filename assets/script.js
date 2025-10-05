// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle (progressive enhancement)
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

// Smooth scroll for in-page anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', `#${id}`);
    }
  });
});
