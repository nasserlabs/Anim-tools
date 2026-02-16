/**
 * ANIM'TOOLS — MODULE INVENTAIRE
 * Gère le chargement, l'affichage, les filtres et les détails des activités.
 * Autonome : ne dépend d'aucun autre module sauf favorites.js (optionnel).
 *
 * Exposition globale : window.inventoryModule
 */

class InventoryModule {
  constructor() {
    this.activities    = [];
    this.categories    = [];
    this.currentCategory = 'all';
    this.activeFilters = { age: 'all', duration: 'all', location: 'all' };
  }

  /* ═══════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════ */

  /** Point d'entrée : lancé uniquement sur inventaire.html */
  async init() {
    // Sécurité : ne rien faire si on n'est pas sur la page inventaire
    if (!document.getElementById('activitiesGrid')) return;

    await this.loadActivities();
    this.renderCategories();
    this.renderActivities();
    this.initAdvancedFilters();

    // Si favorites.js est chargé, afficher la section favoris
    if (window.favoritesManager) {
      window.favoritesManager.renderFavoritesSection();
    }

    // Lien direct vers une activité (?activity=act001)
    const params  = new URLSearchParams(window.location.search);
    const actId   = params.get('activity');
    if (actId) this.highlightActivity(actId);

    console.log(`📦 InventoryModule : ${this.activities.length} activités chargées`);
  }

  /* ═══════════════════════════════════════════════
     CHARGEMENT DES DONNÉES
  ═══════════════════════════════════════════════ */

  async loadActivities() {
    try {
      const res  = await fetch('data/activities.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.activities = data.activities  || [];
      this.categories = data.categories  || [];
    } catch (err) {
      console.error('InventoryModule : erreur de chargement JSON', err);
      this.activities = [];
      this.categories = [];
    }
  }

  /* ═══════════════════════════════════════════════
     RENDU DES CATÉGORIES
  ═══════════════════════════════════════════════ */

  renderCategories() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = this.categories.map((cat, i) => `
      <button
        class="reglem-tab${cat.id === 'all' ? ' active' : ''}"
        data-category="${cat.id}"
        role="tab"
        aria-selected="${cat.id === 'all'}"
        style="animation-delay:${i * 40}ms"
      >
        ${cat.emoji ? `<span aria-hidden="true">${cat.emoji}</span> ` : ''}${cat.label}
      </button>
    `).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn) return;

      container.querySelectorAll('.reglem-tab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      this.filterByCategory(btn.dataset.category);
    });
  }

  /* ═══════════════════════════════════════════════
     RENDU DES ACTIVITÉS
  ═══════════════════════════════════════════════ */

  /**
   * Affiche les activités selon la catégorie active ET les filtres avancés.
   * @param {Array|null} override - passer un tableau pré-filtré (depuis initAdvancedFilters)
   */
  renderActivities(override = null) {
    const container = document.getElementById('activitiesGrid');
    if (!container) return;

    let list = override !== null ? override : this._applyAllFilters();

    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.textContent = `${list.length} activité${list.length !== 1 ? 's' : ''} trouvée${list.length !== 1 ? 's' : ''}`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-tertiary);">
          <div style="font-size:2rem;margin-bottom:.75rem;">🔍</div>
          <p>Aucune activité ne correspond aux filtres sélectionnés.</p>
        </div>`;
      return;
    }

    container.innerHTML = list.map(activity => this._buildActivityCard(activity)).join('');
  }

  /** Construit le HTML d'une carte activité */
  _buildActivityCard(activity) {
    const cat   = this._getCat(activity.category);
    const grad  = cat?.gradient || 'linear-gradient(135deg,#667EEA,#764BA2)';
    const label = cat?.label    || activity.category;

    const durLabel  = this._formatDuration(activity.duration);
    const ageLabel  = this._formatAge(activity.age);
    const locIcon   = activity.location === 'outdoor' ? '🌿' : '🏠';
    const diffStars = '★'.repeat(activity.difficulty || 1) + '☆'.repeat(3 - (activity.difficulty || 1));

    const favBtn = window.favoritesManager
      ? window.favoritesManager.renderFavoriteButton(activity.id)
      : '';

    return `
      <article
        class="activity-card"
        data-activity-id="${activity.id}"
        role="button"
        tabindex="0"
        aria-label="Voir les détails : ${activity.name}"
        onclick="window.inventoryModule.openActivityDetails('${activity.id}')"
        onkeydown="if(event.key==='Enter'||event.key===' ')window.inventoryModule.openActivityDetails('${activity.id}')"
      >
        <div class="activity-image" style="background:${grad};position:relative;">
          <span class="activity-category-badge">${cat?.emoji || ''} ${label}</span>
          <div style="position:absolute;top:10px;right:10px;">${favBtn}</div>
        </div>
        <div class="activity-content">
          <h3 class="activity-title">${activity.name}</h3>
          <div class="activity-meta">
            <span title="Âge">👶 ${ageLabel}</span>
            <span>·</span>
            <span title="Durée">⏱ ${durLabel}</span>
            <span>·</span>
            <span title="Lieu">${locIcon}</span>
            <span>·</span>
            <span title="Difficulté" style="letter-spacing:-.5px;">${diffStars}</span>
          </div>
          <p class="activity-description">${activity.description}</p>
        </div>
      </article>`;
  }

  /* ═══════════════════════════════════════════════
     FILTRES
  ═══════════════════════════════════════════════ */

  filterByCategory(category) {
    this.currentCategory = category;
    this.renderActivities();
  }

  initAdvancedFilters() {
    const ageEl      = document.getElementById('ageFilter');
    const durEl      = document.getElementById('durationFilter');
    const locEl      = document.getElementById('locationFilter');
    const resetEl    = document.getElementById('resetFilters');

    if (!ageEl) return;

    const onChange = () => {
      this.activeFilters.age      = ageEl.value;
      this.activeFilters.duration = durEl?.value || 'all';
      this.activeFilters.location = locEl?.value || 'all';
      this.renderActivities();
    };

    ageEl.addEventListener('change', onChange);
    durEl?.addEventListener('change', onChange);
    locEl?.addEventListener('change', onChange);

    resetEl?.addEventListener('click', () => {
      if (ageEl) ageEl.value      = 'all';
      if (durEl) durEl.value      = 'all';
      if (locEl) locEl.value      = 'all';
      this.activeFilters = { age: 'all', duration: 'all', location: 'all' };
      this.renderActivities();
    });
  }

  /** Applique catégorie + filtres avancés et retourne la liste résultante */
  _applyAllFilters() {
    let list = this.currentCategory === 'all'
      ? [...this.activities]
      : this.activities.filter(a => a.category === this.currentCategory);

    const { age, duration, location } = this.activeFilters;

    if (age !== 'all') {
      list = list.filter(a => {
        const [min, max] = (a.age || '').split('-').map(Number);
        const [fMin, fMax] = age.split('-').map(Number);
        return min <= fMax && max >= fMin;
      });
    }

    if (duration !== 'all') {
      list = list.filter(a => {
        const d = parseInt(a.duration, 10);
        if (duration === 'short')  return d <= 30;
        if (duration === 'medium') return d > 30 && d <= 60;
        if (duration === 'long')   return d > 60;
        return true;
      });
    }

    if (location !== 'all') {
      list = list.filter(a => a.location === location);
    }

    return list;
  }

  /* ═══════════════════════════════════════════════
     DÉTAIL ACTIVITÉ (PEEK MODAL)
  ═══════════════════════════════════════════════ */

  openActivityDetails(activityId) {
    const activity = this.activities.find(a => a.id === activityId);
    if (!activity) return;

    // Tracking badges (appel optionnel)
    window.badgesManager?.trackEvent('activityViewed');

    const cat   = this._getCat(activity.category);
    const grad  = cat?.gradient || 'linear-gradient(135deg,#667EEA,#764BA2)';
    const label = cat?.label    || activity.category;

    // Créer ou récupérer l'overlay
    let overlay = document.getElementById('peekOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'peekOverlay';
      overlay.className = 'peek-overlay';
      document.body.appendChild(overlay);
    }

    const stepsHtml = activity.steps?.length
      ? `<div class="peek-section">
           <h3 class="peek-section-title">Déroulement étape par étape</h3>
           <ol class="peek-steps">${activity.steps.map(s => `<li>${s}</li>`).join('')}</ol>
         </div>` : '';

    const materialsHtml = activity.material?.length
      ? `<div class="peek-section">
           <h3 class="peek-section-title">🎒 Matériel nécessaire</h3>
           <ul class="peek-list">${activity.material.map(m => `<li>${m}</li>`).join('')}</ul>
         </div>` : '';

    const objectivesHtml = activity.objectives?.length
      ? `<div class="peek-section">
           <h3 class="peek-section-title">🎯 Objectifs pédagogiques</h3>
           <ul class="peek-list">${activity.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
         </div>` : '';

    const partic = activity.participants
      ? `${activity.participants.min}–${activity.participants.max} enfants`
      : '';

    const favBtn = window.favoritesManager
      ? window.favoritesManager.renderFavoriteButton(activity.id)
      : '';

    overlay.innerHTML = `
      <div class="peek-modal" role="dialog" aria-modal="true" aria-label="${activity.name}">
        <div class="peek-header" style="background:${grad};padding:32px 28px 24px;border-radius:16px 16px 0 0;color:#fff;position:relative;">
          <button
            class="peek-close"
            onclick="window.inventoryModule.closeActivityDetails()"
            aria-label="Fermer"
            style="position:absolute;top:16px;left:16px;background:rgba(255,255,255,.2);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div style="position:absolute;top:16px;right:16px;">${favBtn}</div>
          <div style="margin-bottom:8px;"><span style="background:rgba(255,255,255,.25);padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;">${cat?.emoji || ''} ${label}</span></div>
          <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 16px;line-height:1.3;">${activity.name}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:.85rem;">
            <span>👶 ${this._formatAge(activity.age)}</span>
            <span>⏱ ${this._formatDuration(activity.duration)}</span>
            ${partic ? `<span>👥 ${partic}</span>` : ''}
            <span>${activity.location === 'outdoor' ? '🌿 Extérieur' : '🏠 Intérieur'}</span>
            <span>${'★'.repeat(activity.difficulty || 1)}${'☆'.repeat(3 - (activity.difficulty || 1))}</span>
          </div>
        </div>
        <div class="peek-content" style="padding:24px 28px;overflow-y:auto;max-height:60vh;">
          <div class="peek-section">
            <p class="peek-description" style="font-size:1rem;line-height:1.7;color:var(--color-secondary);">${activity.description}</p>
          </div>
          ${objectivesHtml}
          ${materialsHtml}
          ${stepsHtml}
        </div>
      </div>`;

    // Afficher avec animation CSS
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Fermer au clic sur le fond
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeActivityDetails();
    }, { once: true });

    // Fermer avec Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeActivityDetails();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closeActivityDetails() {
    const overlay = document.getElementById('peekOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  /* ═══════════════════════════════════════════════
     UTILITAIRES
  ═══════════════════════════════════════════════ */

  highlightActivity(activityId) {
    setTimeout(() => {
      const card = document.querySelector(`[data-activity-id="${activityId}"]`);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '3px solid var(--color-accent)';
      card.style.outlineOffset = '4px';
      setTimeout(() => { card.style.outline = ''; card.style.outlineOffset = ''; }, 2500);
    }, 400);
  }

  _getCat(id) {
    return this.categories.find(c => c.id === id) || null;
  }

  _formatDuration(minutes) {
    if (!minutes && minutes !== 0) return '?';
    const m = parseInt(minutes, 10);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h}h${String(r).padStart(2,'0')}` : `${h}h`;
  }

  _formatAge(age) {
    if (!age) return '?';
    return `${age} ans`;
  }
}

/* ═══════════════════════════════════════════════
   AUTO-INIT — uniquement sur inventaire.html
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  window.inventoryModule = new InventoryModule();
  await window.inventoryModule.init();
});
