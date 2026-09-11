/* cache-bust: 2 */
/* Apply stored theme before paint to avoid a light→dark flash. */
(function () {
  try {
    var t = localStorage.getItem('ba-theme');
    var systemDark = false;
    try {
      systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      /* ignore */
    }
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
    var dark = t === 'dark' || (t !== 'light' && systemDark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#141210' : '#FFFDF7');
  } catch (e) {
    /* private mode */
  }
})();
