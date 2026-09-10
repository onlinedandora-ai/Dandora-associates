/**
 * Dandora.online Associate Platform - GSAP Animation Engine
 * Delivers dynamic micro-animations, staggered reveals, counter animations,
 * and fluid screen transitions across Web and Mobile views.
 */

(function () {
  'use strict';

  // Wait until DOM and GSAP are ready
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP library not detected. Loading fallback CDN...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      script.onload = () => setupAnimations();
      document.head.appendChild(script);
      return;
    }
    setupAnimations();
  }

  function setupAnimations() {
    // 1. Hero & Header Stagger Entrance
    const heroTitle = document.querySelector('.hero-title, .hero h1, .screen-title');
    const heroBadges = document.querySelectorAll('.badge, .m-badge');
    const heroSub = document.querySelector('.hero-subtitle, .hero p, .screen-sub');
    const heroCtas = document.querySelectorAll('.hero-cta-group, .hero .btn, .btn-primary');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    if (heroBadges.length > 0) {
      tl.from(heroBadges, { opacity: 0, y: -15, stagger: 0.1, duration: 0.6 }, '+=0.1');
    }

    if (heroTitle) {
      tl.from(heroTitle, { opacity: 0, y: 30, duration: 0.9 }, '-=0.4');
    }

    if (heroSub) {
      tl.from(heroSub, { opacity: 0, y: 20, duration: 0.8 }, '-=0.5');
    }

    if (heroCtas.length > 0) {
      tl.from(heroCtas, { opacity: 0, scale: 0.95, y: 15, stagger: 0.1, duration: 0.6 }, '-=0.4');
    }

    // 2. Animated Numerical Counters (Commissions, Payouts, Deals)
    animateNumberCounters();

    // 3. Floating Glow Elements
    initFloatingElements();

    // 4. Interactive Card Hover Depth
    initCardDepthHover();

    // 5. Mobile App Transitions (if in mobile shell)
    initMobileGSAPHooks();
  }

  // Counter animation using GSAP
  function animateNumberCounters() {
    const counterElements = document.querySelectorAll('[data-counter], .stat-value, .metric-number');
    counterElements.forEach((el) => {
      const rawText = el.innerText.trim();
      // Extract numeric value
      const match = rawText.match(/\d+[\d,]*/);
      if (!match) return;

      const targetValue = parseInt(match[0].replace(/,/g, ''), 10);
      if (isNaN(targetValue)) return;

      const prefix = rawText.slice(0, match.index);
      const suffix = rawText.slice(match.index + match[0].length);

      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetValue,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: el,
        onUpdate: () => {
          el.innerText = `${prefix}${Math.floor(obj.val).toLocaleString('en-IN')}${suffix}`;
        }
      });
    });
  }

  // Gentle floating pulse for badges and highlighted cards
  function initFloatingElements() {
    const floatingBadges = document.querySelectorAll('.sync-status-pill, .badge-won, .nav-fab-btn');
    floatingBadges.forEach((badge) => {
      gsap.to(badge, {
        y: -4,
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        ease: 'sine.inOut'
      });
    });
  }

  // Card depth tilt and scale
  function initCardDepthHover() {
    const cards = document.querySelectorAll('.m-card, .tier-card, .feature-card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -4,
          scale: 1.015,
          boxShadow: '0 12px 30px rgba(0, 229, 255, 0.15)',
          duration: 0.3,
          ease: 'power1.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: 'none',
          duration: 0.3,
          ease: 'power1.out'
        });
      });
    });
  }

  // Mobile App Native-like screen transitions
  function initMobileGSAPHooks() {
    window.animateMobileScreenTransition = function (targetScreenElem) {
      if (!targetScreenElem || typeof gsap === 'undefined') return;
      gsap.fromTo(
        targetScreenElem,
        { opacity: 0, x: 25, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    };

    window.animateLeadSuccess = function (leadCardElem) {
      if (!leadCardElem || typeof gsap === 'undefined') return;
      gsap.fromTo(
        leadCardElem,
        { scale: 0.7, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );
    };
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAPAnimations);
  } else {
    initGSAPAnimations();
  }
})();
