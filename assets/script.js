document.documentElement.classList.add('js');

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
