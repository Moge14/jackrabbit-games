/**
 * main.js — Jackrabbit Games
 *
 * Responsibilities:
 *  - Navbar scroll shadow + hamburger menu
 *  - Smooth-scroll anchor links (mobile menu close on click)
 *  - Scroll-triggered reveal animations (IntersectionObserver)
 *  - Support form → mailto fallback (works on GitHub Pages with no server)
 *  - Modal close (keyboard + overlay click)
 *  - Boot: calls window.JR.initGames() and window.JR.renderUpcoming()
 *
 * SUPPORT EMAIL TARGET: JooMoose3@gmail.com
 */

/* ── CONSTANTS ──────────────────────────────────────────────────────────────── */
const SUPPORT_EMAIL = 'JooMoose3@gmail.com';

/* ── NAVBAR: scroll shadow ──────────────────────────────────────────────────── */
(function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── NAVBAR: hamburger toggle ───────────────────────────────────────────────── */
(function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // Close when a mobile link is tapped
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    });
  });
})();

/* ── SMOOTH SCROLL for anchor nav links ─────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── REVEAL ANIMATIONS (IntersectionObserver) ───────────────────────────────── */
(function initReveal() {
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  // Observe existing + future .reveal elements (games are added dynamically)
  const observeAll = () =>
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => io.observe(el));

  observeAll();

  // Re-run briefly after games load
  setTimeout(observeAll, 800);
  setTimeout(observeAll, 1800);
})();

/* ── MODAL CLOSE ────────────────────────────────────────────────────────────── */
(function initModal() {
  const overlay = document.getElementById('game-modal');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (window.JR && window.JR.closeGameModal) window.JR.closeGameModal();
    });
  }

  if (overlay) {
    // Click outside the modal box to close
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        if (window.JR && window.JR.closeGameModal) window.JR.closeGameModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') {
      if (window.JR && window.JR.closeGameModal) window.JR.closeGameModal();
    }
  });
})();

/* ── SUPPORT FORM ───────────────────────────────────────────────────────────── */
/**
 * GitHub Pages has no server-side code, so we use a mailto: link as the
 * primary delivery method. This opens the user's default mail client
 * pre-filled with their message addressed to SUPPORT_EMAIL.
 *
 * Optionally: replace this handler with a fetch() to a Formspree endpoint
 * (https://formspree.io) for silent background sends without page navigation.
 * Example Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
 */
(function initSupportForm() {
  const form     = document.getElementById('support-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `form-feedback ${type}`;
    feedback.style.display = 'block';
    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = document.getElementById('s-name').value.trim();
    const email   = document.getElementById('s-email').value.trim();
    const subject = document.getElementById('s-subject');
    const subjectLabel = subject.options[subject.selectedIndex].text;
    const msg     = document.getElementById('s-msg').value.trim();

    // Basic validation
    if (!name || !email || !msg) {
      showFeedback('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // Build mailto body
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${subjectLabel}\n\n${msg}`
    );
    const mailSubject = encodeURIComponent(`[Jackrabbit Games] ${subjectLabel} from ${name}`);
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${body}`;

    // Open mail client
    window.location.href = mailto;

    showFeedback(
      '✓ Your mail client should open now. If it doesn\'t, email us directly at ' + SUPPORT_EMAIL,
      'success'
    );

    form.reset();
  });
})();

/* ── BOOT ───────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (window.JR) {
    window.JR.initGames();
    window.JR.renderUpcoming();
  } else {
    console.error('[main.js] window.JR not found — make sure games.js loads before main.js');
  }
});
