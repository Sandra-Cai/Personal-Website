/* cache-bust: 1 */
/* Restore Gauss gate unlock before paint to avoid a content flash. */
(function () {
  try {
    var KEY = 'ba-gauss-gate';
    var OK = '64f9ddffe575d0b9decc45358acd194055c2e712e4fa1b5f4a9a5de582e825a9';
    if (sessionStorage.getItem(KEY) === OK) {
      document.documentElement.classList.remove('gauss-locked');
    }
  } catch (e) {
    /* private mode: keep locked until interact */
  }
})();
