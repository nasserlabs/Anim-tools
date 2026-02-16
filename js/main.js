/**
 * ANIM'TOOLS — SCRIPT PRINCIPAL (v2 — allégé)
 * Responsabilités : navigation, animations, routing de pages.
 * L'inventaire est délégué à inventory.js.
 * L'administratif est délégué à administratif.js.
 * La gamification est délégée à badges.js.
 */

class AnimTools {
  constructor() {
    this.init();
  }

  /* ═══════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════ */

  init() {
    this.setupNavigation();
    this.setupAnimations();
    this.initializePage();

    console.log("🎨 Anim'Tools chargé");
  }

  /* ═══════════════════════════════════════════════
     NAVIGATION
  ═══════════════════════════════════════════════ */

  setupNavigation() {
    const navbar = document.querySelector('.navbar');

    // Effet scroll
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.pageYOffset > 50);
      }, { passive: true });
    }

    this.setActiveNavLink();
  }

  setActiveNavLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ═══════════════════════════════════════════════
     ANIMATIONS AU SCROLL
  ═══════════════════════════════════════════════ */

  setupAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.card, .reglem-fiche, .section-header').forEach(el => {
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════
     ROUTING PAR PAGE
  ═══════════════════════════════════════════════ */

  initializePage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    switch (page) {
      case 'inventaire.html':
        this.initInventairePage();
        break;
      case 'planning.html':
        this.initPlanningPage();
        break;
      case 'reglementation.html':
        this.initReglementationPage();
        break;
      case 'administratif.html':
        this.initAdministratifPage();
        break;
      case 'badges.html':
        this.initBadgesPage();
        break;
      default:
        this.initHomePage();
    }
  }

  /* ═══════════════════════════════════════════════
     INIT PAR PAGE
  ═══════════════════════════════════════════════ */

  initHomePage() {
    // Animation mascotte
    const mascotte = document.querySelector('.mascotte');
    if (mascotte) {
      mascotte.addEventListener('mouseenter', () => {
        mascotte.style.transform = 'scale(1.1) rotate(5deg)';
      });
      mascotte.addEventListener('mouseleave', () => {
        mascotte.style.transform = '';
      });
    }
  }

  /** Inventaire : délégué à window.inventoryModule (inventory.js) */
  initInventairePage() {
    // inventory.js s'auto-init via son propre DOMContentLoaded.
    // On s'assure simplement qu'il est présent.
    if (!window.inventoryModule) {
      console.warn('inventory.js non chargé sur cette page.');
    }
  }

  /** Planning : module futur ou logique existante dans planning.js */
  initPlanningPage() {
    console.log('📅 Page planning prête');
    // planning.js peut écouter DOMContentLoaded de son côté
  }

  /** Réglementation : accordéons, tabs — logique native dans le HTML */
  initReglementationPage() {
    console.log('📋 Page réglementation prête');
  }

  /** Administratif : délégué à window.administratifModule (administratif.js) */
  initAdministratifPage() {
    if (!window.administratifModule) {
      console.warn('administratif.js non chargé sur cette page.');
    }
  }

  /** Badges : délégué à window.badgesManager (badges.js) */
  initBadgesPage() {
    if (!window.badgesManager) {
      console.warn('badges.js non chargé sur cette page.');
    }
  }
}

/* ═══════════════════════════════════════════════
   AUTO-INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  window.animTools = new AnimTools();
});

// Smooth scroll pour les ancres
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimTools;
}
