'use strict';

/* ============================================================
   Olya's Mobile Nails — main.js
============================================================ */

// ---- Footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Set date input min to today ----
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// ---- Header scroll effect ----
const header = document.getElementById('header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---- Mobile hamburger menu ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Service tabs ----
const tabBtns = document.querySelectorAll('.tab-btn');
const tabIds = ['pedicures', 'manicures', 'gelx', 'combos', 'addons'];

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    tabIds.forEach(id => {
      const panel = document.getElementById(`tab-${id}`);
      if (panel) panel.classList.toggle('hidden', id !== target);
    });
  });
});

// ---- Scroll reveal ----
const reveals = document.querySelectorAll(
  '.service-card, .step, .testimonial, .city-list li, .faq__item, .trust-bar__item, .gallery__item'
);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ---- Sticky CTA show/hide ----
const stickyCta = document.getElementById('stickyCta');
if (stickyCta) {
  const bookingSection = document.getElementById('booking');
  const heroSection = document.getElementById('home');

  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === heroSection) {
        stickyCta.style.opacity = entry.isIntersecting ? '0' : '1';
        stickyCta.setAttribute('aria-hidden', String(entry.isIntersecting));
      }
    });
  }, { threshold: 0.1 });

  if (heroSection) ctaObserver.observe(heroSection);
}

// ---- Smooth anchor scrolling with offset ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---- Booking form validation & submission ----
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');

if (bookingForm) {
  const fields = {
    fname:   { el: document.getElementById('fname'),   err: document.getElementById('fname-error'),   validate: v => v.trim().length >= 2 ? '' : 'Please enter your first name.' },
    lname:   { el: document.getElementById('lname'),   err: document.getElementById('lname-error'),   validate: v => v.trim().length >= 2 ? '' : 'Please enter your last name.' },
    phone:   { el: document.getElementById('phone'),   err: document.getElementById('phone-error'),   validate: v => /[\d\s\-().+]{7,}/.test(v) ? '' : 'Please enter a valid phone number.' },
    service: { el: document.getElementById('service'), err: document.getElementById('service-error'), validate: v => v ? '' : 'Please select a service.' },
    date:    { el: document.getElementById('date'),    err: document.getElementById('date-error'),    validate: v => v ? '' : 'Please choose a date.' },
    time:    { el: document.getElementById('time'),    err: document.getElementById('time-error'),    validate: v => v ? '' : 'Please choose a time.' },
    address: { el: document.getElementById('address'), err: document.getElementById('address-error'), validate: v => v.trim().length >= 5 ? '' : 'Please enter your address.' },
  };

  const validateField = (key) => {
    const f = fields[key];
    if (!f.el) return true;
    const msg = f.validate(f.el.value);
    if (f.err) f.err.textContent = msg;
    f.el.classList.toggle('error', !!msg);
    return !msg;
  };

  // Live validation on blur
  Object.keys(fields).forEach(key => {
    const f = fields[key];
    if (f.el) f.el.addEventListener('blur', () => validateField(key));
    if (f.el) f.el.addEventListener('input', () => {
      if (f.el.classList.contains('error')) validateField(key);
    });
  });

  bookingForm.addEventListener('submit', (e) => {
    let valid = true;
    Object.keys(fields).forEach(key => { if (!validateField(key)) valid = false; });

    if (!valid) {
      e.preventDefault();
      // Scroll to first error
      const firstError = bookingForm.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Form is valid — let FormSubmit.co handle it natively (page redirect to #booking-confirmed)
    // We also show a local success state immediately for UX
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
    }
  });
}

// Show success state if URL contains #booking-confirmed (after FormSubmit redirect)
if (window.location.hash === '#booking-confirmed' && bookingForm && bookingSuccess) {
  bookingForm.classList.add('hidden');
  bookingSuccess.classList.remove('hidden');
  bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- Gallery lightbox (simple) ----
document.querySelectorAll('.gallery__item').forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  const label = item.getAttribute('aria-label') || 'Nail photo';

  const open = () => {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', label);
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:999;background:rgba(44,26,36,0.92);
      display:flex;align-items:center;justify-content:center;cursor:pointer;
      backdrop-filter:blur(8px);animation:fadeInDown 0.25s ease;
    `;
    overlay.innerHTML = `
      <div style="background:${getComputedStyle(item).getPropertyValue('--bg') || '#e8a4b8'};
                  width:min(90vw,460px);aspect-ratio:1;border-radius:20px;
                  box-shadow:0 20px 60px rgba(0,0,0,0.5);position:relative;
                  display:flex;align-items:center;justify-content:center;">
        <span style="font-size:4rem;">💅</span>
        <span style="position:absolute;top:1rem;right:1rem;font-size:1.5rem;color:white;
                     background:rgba(0,0,0,0.4);border-radius:50%;width:36px;height:36px;
                     display:flex;align-items:center;justify-content:center;">&times;</span>
      </div>
      <p style="position:absolute;bottom:2rem;color:rgba(255,255,255,0.7);font-size:0.9rem;">${label} — Replace gallery items with real photos</p>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
      item.focus();
    };
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  };

  item.addEventListener('click', open);
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.header__nav a[href^="#"]');

if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active-nav', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => navObserver.observe(s));
}

// Highlight active nav link styles
const style = document.createElement('style');
style.textContent = `.active-nav { background: var(--pink-light); color: var(--pink-dark) !important; }`;
document.head.appendChild(style);
