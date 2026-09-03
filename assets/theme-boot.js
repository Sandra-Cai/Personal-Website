/* cache-bust: 1 */
/* Apply stored theme before paint to avoid a light→dark flash. */
(function () {
  try {
    var t = localStorage.getItem('ba-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {
    /* private mode */
  }
})();
