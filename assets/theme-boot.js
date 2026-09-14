/* cache-bust: 4 */
/* Apply stored theme before paint to avoid a light→dark flash. */
(function () {
  try {
    var LIGHT = '#FFFDF7';
    var DARK = '#141210';
    var t = localStorage.getItem('ba-theme');
    if (t != null && t !== 'light' && t !== 'dark') {
      try {
        localStorage.removeItem('ba-theme');
      } catch (e) {
        /* ignore */
      }
      t = null;
    }
    var systemDark = false;
    try {
      systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      /* ignore */
    }
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    var setAll = function (color) {
      for (var i = 0; i < metas.length; i++) {
        metas[i].setAttribute('content', color);
      }
    };
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
      var forced = t === 'dark' ? DARK : LIGHT;
      document.documentElement.style.colorScheme = t;
      setAll(forced);
      return;
    }
    var dark = systemDark;
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    for (var j = 0; j < metas.length; j++) {
      var meta = metas[j];
      var media = meta.getAttribute('media') || '';
      if (media.indexOf('dark') !== -1) meta.setAttribute('content', DARK);
      else if (media.indexOf('light') !== -1) meta.setAttribute('content', LIGHT);
      else meta.setAttribute('content', dark ? DARK : LIGHT);
    }
  } catch (e) {
    /* private mode */
  }
})();
