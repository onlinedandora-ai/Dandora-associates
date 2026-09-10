/**
 * Dandora.online Associate Platform - Impeccable GSAP Motion & Interaction Engine
 * Features:
 * 1. Dynamic Cursor-Spotlight Border Lighting (Hardware accelerated)
 * 2. Magnetic Spring Physics for Primary Buttons
 * 3. Viewport-Triggered Stagger Reveals (Blur-to-Focus, Elastic Y-axis)
 * 4. Tabular Rolling Number Counters with Indian Rupee Formatting
 * 5. Native-Grade Mobile & Simulator Transitions
 */

(function () {
  'use strict';

  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      script.onload = () => setupEngine();
      document.head.appendChild(script);
      return;
    }
    setupEngine();
  }

  function setupEngine() {
    // 1. Hero Entrance Timeline
    initHeroEntrance();

    // 2. Dynamic Cursor-Spotlight on Cards
    initCardSpotlights();

    // 3. Magnetic Button Physics
    initMagneticButtons();

    // 4. Viewport Scroll-Triggered Stagger Reveals
    initScrollStaggers();

    // 5. High-Precision Animated Number Counters
    initRollingCounters();

    // 6. Interactive Simulator Controls & Mobile Transitions
    initSimulatorAndMobileHooks();
  }

  // -----------------------------------------------------------
  // 1. Hero Entrance Timeline
  // -----------------------------------------------------------
  function initHeroEntrance() {
    const heroTitle = document.querySelector('.hero-title');
    const heroBadge = document.querySelector('.hero-badge-wrap');
    const heroSub = document.querySelector('.hero-description');
    const heroCtas = document.querySelectorAll('.hero-cta-group .btn');
    const trustStrip = document.querySelector('.trust-strip');
    const heroPreview = document.querySelector('.hero-dashboard-preview');
    const floatingBadges = document.querySelectorAll('.floating-stat-card');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroBadge) {
      tl.from(heroBadge, { opacity: 0, y: -20, duration: 0.7 });
    }

    if (heroTitle) {
      tl.from(heroTitle, { opacity: 0, y: 35, duration: 0.9 }, '-=0.4');
    }

    if (heroSub) {
      tl.from(heroSub, { opacity: 0, y: 25, duration: 0.8 }, '-=0.5');
    }

    if (heroCtas.length > 0) {
      tl.from(heroCtas, { opacity: 0, scale: 0.94, y: 20, stagger: 0.1, duration: 0.6 }, '-=0.4');
    }

    if (trustStrip) {
      tl.from(trustStrip, { opacity: 0, y: 15, duration: 0.6 }, '-=0.3');
    }

    if (heroPreview) {
      tl.from(heroPreview, { opacity: 0, scale: 0.92, y: 40, duration: 1.1, ease: 'power2.out' }, '-=0.8');
    }

    if (floatingBadges.length > 0) {
      tl.from(floatingBadges, { opacity: 0, scale: 0.8, y: 20, stagger: 0.15, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.4');
      // Gentle floating physics
      floatingBadges.forEach((badge, index) => {
        gsap.to(badge, {
          y: index % 2 === 0 ? -6 : 6,
          repeat: -1,
          yoyo: true,
          duration: 2.2 + index * 0.4,
          ease: 'sine.inOut'
        });
      });
    }
  }

  // -----------------------------------------------------------
  // 2. Dynamic Cursor-Spotlight on Cards
  // -----------------------------------------------------------
  function initCardSpotlights() {
    const cards = document.querySelectorAll(
      '.hero-dashboard-preview, .preview-stat-card, .m-card, .feature-card, .tier-card, .segment-card, .simulator-shell, .step-card, .tool-card'
    );

    cards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // -----------------------------------------------------------
  // 3. Magnetic Button Physics
  // -----------------------------------------------------------
  function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-primary, #heroPrimaryCta, .nav-fab-btn');

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  // -----------------------------------------------------------
  // 4. Viewport Scroll-Triggered Stagger Reveals
  // -----------------------------------------------------------
  function initScrollStaggers() {
    if (!('IntersectionObserver' in window)) return;

    const sections = document.querySelectorAll('.section, .section-header, .tier-grid, .features-grid, .steps-grid');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const children = target.querySelectorAll('.section-title, .section-subtitle, .tier-card, .feature-card, .step-card');

            if (children.length > 0) {
              gsap.fromTo(
                children,
                { opacity: 0, y: 35, filter: 'blur(4px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power2.out' }
              );
            } else {
              gsap.fromTo(
                target,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }
              );
            }

            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // -----------------------------------------------------------
  // 5. Rolling Number Counters with Indian Currency
  // -----------------------------------------------------------
  function initRollingCounters() {
    const counterElements = document.querySelectorAll('[data-counter], .stat-amount, .calc-result-val, .metric-number');

    counterElements.forEach((el) => {
      const rawText = el.innerText.trim();
      const match = rawText.match(/\d+[\d,]*/);
      if (!match) return;

      const targetValue = parseInt(match[0].replace(/,/g, ''), 10);
      if (isNaN(targetValue)) return;

      const prefix = rawText.slice(0, match.index);
      const suffix = rawText.slice(match.index + match[0].length);

      const obj = { val: 0 };
      const duration = targetValue > 50000 ? 2.0 : 1.4;

      gsap.to(obj, {
        val: targetValue,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.innerText = `${prefix}${Math.floor(obj.val).toLocaleString('en-IN')}${suffix}`;
        }
      });
    });
  }

  // -----------------------------------------------------------
  // 6. Interactive Simulator & Mobile Native Motion Hooks
  // -----------------------------------------------------------
  function initSimulatorAndMobileHooks() {
    // Screen transition hook
    window.animateMobileScreenTransition = function (targetScreenElem) {
      if (!targetScreenElem || typeof gsap === 'undefined') return;
      gsap.fromTo(
        targetScreenElem,
        { opacity: 0, x: 28, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.38, ease: 'power2.out' }
      );
    };

    // Lead Success Bouncy Pop
    window.animateLeadSuccess = function (leadCardElem) {
      if (!leadCardElem || typeof gsap === 'undefined') return;
      gsap.fromTo(
        leadCardElem,
        { scale: 0.65, opacity: 0, y: -25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.9)' }
      );
    };

    // Simulator Interactive Tab Buttons (in landing page simulator)
    const simTabBtns = document.querySelectorAll('.sim-tab-btn');
    if (simTabBtns.length > 0) {
      simTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          simTabBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const targetTab = btn.getAttribute('data-sim-tab');
          const targetScreen = document.getElementById(`sim-screen-${targetTab}`);
          if (targetScreen) {
            document.querySelectorAll('.sim-screen').forEach((s) => s.classList.remove('active'));
            targetScreen.classList.add('active');
            window.animateMobileScreenTransition(targetScreen);
          }
        });
      });
    }
  }

  // Auto-run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGSAPAnimations);
  } else {
    initGSAPAnimations();
  }
})();
