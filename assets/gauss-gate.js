/* cache-bust: 2 */
(function () {
  const KEY = 'ba-gauss-gate';
  /** SHA-256 of the canonical decimal answer (no commas/spaces). */
  const ANSWER_HASH = '64f9ddffe575d0b9decc45358acd194055c2e712e4fa1b5f4a9a5de582e825a9';

  const gate = document.getElementById('gauss-gate');
  const form = document.getElementById('gauss-gate-form');
  const input = document.getElementById('gauss-gate-answer');
  const status = document.getElementById('gauss-gate-status');
  if (!gate || !form || !input) return;

  function alreadyUnlocked() {
    try {
      return sessionStorage.getItem(KEY) === ANSWER_HASH;
    } catch {
      return false;
    }
  }

  function unlock() {
    document.documentElement.classList.remove('gauss-locked');
    gate.hidden = true;
    gate.setAttribute('aria-hidden', 'true');
    try {
      sessionStorage.setItem(KEY, ANSWER_HASH);
    } catch {
      /* private mode: unlock this load only */
    }
    const main = document.getElementById('top') || document.getElementById('main');
    if (main) {
      try {
        main.focus({ preventScroll: true });
      } catch {
        try {
          main.focus();
        } catch {
          /* ignore */
        }
      }
    }
  }

  function normalize(raw) {
    return String(raw || '')
      .trim()
      .replace(/[\s,_]/g, '')
      .replace(/^\+/, '');
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('gauss-gate-status--ok', 'gauss-gate-status--err');
    if (kind) status.classList.add(`gauss-gate-status--${kind}`);
  }

  if (alreadyUnlocked() || !document.documentElement.classList.contains('gauss-locked')) {
    unlock();
    return;
  }

  gate.hidden = false;
  gate.removeAttribute('aria-hidden');
  window.requestAnimationFrame(() => {
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = normalize(input.value);
    if (!value) {
      setStatus('Enter an integer answer.', 'err');
      input.focus();
      return;
    }
    if (!/^-?\d+$/.test(value)) {
      setStatus('Use digits only (optional leading minus). No words or formulas.', 'err');
      input.focus();
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      setStatus('This gate needs a modern browser with Web Crypto.', 'err');
      return;
    }
    setStatus('Checking…', null);
    form.setAttribute('aria-busy', 'true');
    sha256Hex(value)
      .then((hex) => {
        form.setAttribute('aria-busy', 'false');
        if (hex === ANSWER_HASH) {
          setStatus('Correct. Welcome in.', 'ok');
          unlock();
        } else {
          setStatus('Not quite. Check the range, the ℤ[i] criterion, and the final expression.', 'err');
          input.select();
          input.focus();
        }
      })
      .catch(() => {
        form.setAttribute('aria-busy', 'false');
        setStatus('Could not verify that answer. Try again.', 'err');
      });
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (!document.documentElement.classList.contains('gauss-locked')) return;
      if (e.key !== 'Tab') return;
      const focusables = gate.querySelectorAll('button, [href], input, select, textarea');
      const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    true
  );
})();
