'use strict';

/* ============================================================
   Keen Eye Cleanouts — main.js
============================================================ */

// ---- Footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Header scroll effect ----
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ---- Mobile hamburger ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---- Sticky CTA: hide while hero is visible ----
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.getElementById('home');
if (stickyCta && heroSection && 'IntersectionObserver' in window) {
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const hidden = entry.isIntersecting;
      stickyCta.style.opacity = hidden ? '0' : '1';
      stickyCta.style.pointerEvents = hidden ? 'none' : '';
      stickyCta.setAttribute('aria-hidden', String(hidden));
    });
  }, { threshold: 0.05 });
  ctaObserver.observe(heroSection);
}

// ---- Smooth anchor scroll with header offset ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height')
    ) || 64;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ---- Scroll reveal ----
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 55);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll(
    '.serve-card, .step, .trust-card, .city-card, .faq__item, .pricing-row, .ba-pair, .trust-bar__item'
  ).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ---- Active nav on scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.header__nav a[href^="#"]');

if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active-nav',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => navObserver.observe(s));
}

// Inject active nav style
const style = document.createElement('style');
style.textContent = `.active-nav { background: rgba(255,255,255,0.12) !important; color: var(--gold-light) !important; }`;
document.head.appendChild(style);
