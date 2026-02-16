/**
 * ANIM'TOOLS — SYSTÈME DE GAMIFICATION
 * Gère les badges, les statistiques et leur persistance via localStorage.
 *
 * Exposition globale : window.badgesManager
 * Compatible future migration Firebase / Supabase via la couche StorageAdapter.
 */

/* ═══════════════════════════════════════════════
   CONFIGURATION DES BADGES
   Pour ajouter un badge : copier un objet, modifier id/label/condition.
═══════════════════════════════════════════════ */
const BADGES_CONFIG = [
  {
    id:        'explorateur',
    emoji:     '🔍',
    label:     'Explorateur',
    desc:      'Effectuez 5 recherches dans le catalogue',
    color:     'linear-gradient(135deg,#4FACFE,#00F2FE)',
    condition: (stats) => stats.searchesDone >= 5,
    threshold: { stat: 'searchesDone', target: 5 },
  },
  {
    id:        'curieux',
    emoji:     '👁️',
    label:     'Curieux',
    desc:      'Consultez les détails de 10 activités',
    color:     'linear-gradient(135deg,#667EEA,#764BA2)',
    condition: (stats) => stats.activitiesViewed >= 10,
    threshold: { stat: 'activitiesViewed', target: 10 },
  },
  {
    id:        'creatif',
    emoji:     '🎨',
    label:     'Créatif',
    desc:      'Consultez les détails de 30 activités',
    color:     'linear-gradient(135deg,#FA709A,#FEE140)',
    condition: (stats) => stats.activitiesViewed >= 30,
    threshold: { stat: 'activitiesViewed', target: 30 },
  },
  {
    id:        'organise',
    emoji:     '📅',
    label:     'Organisé',
    desc:      'Créez 3 plannings',
    color:     'linear-gradient(135deg,#43E97B,#38F9D7)',
    condition: (stats) => stats.planningCreated >= 3,
    threshold: { stat: 'planningCreated', target: 3 },
  },
  {
    id:        'bafa_starter',
    emoji:     '🎓',
    label:     'En formation',
    desc:      'Commencez votre suivi BAFA dans l\'administratif',
    color:     'linear-gradient(135deg,#F093FB,#F5576C)',
    condition: (stats) => stats.bafaStarted === true,
    threshold: null,
  },
  {
    id:        'habitue',
    emoji:     '⭐',
    label:     'Habitué',
    desc:      'Visitez le site 7 jours différents',
    color:     'linear-gradient(135deg,#FFC371,#FF5F6D)',
    condition: (stats) => (stats.daysVisited || 0) >= 7,
    threshold: { stat: 'daysVisited', target: 7 },
  },
  {
    id:        'collectionneur',
    emoji:     '🏆',
    label:     'Collectionneur',
    desc:      'Obtenez tous les autres badges',
    color:     'linear-gradient(135deg,#f7971e,#ffd200)',
    condition: (stats, badges) => {
      const others = BADGES_CONFIG.filter(b => b.id !== 'collectionneur');
      return others.every(b => badges.includes(b.id));
    },
    threshold: null,
  },
];

/* ═══════════════════════════════════════════════
   COUCHE STOCKAGE — prête pour migration backend
═══════════════════════════════════════════════ */
const StorageAdapter = {
  KEY: 'animtools_user',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('BadgesManager : impossible de sauvegarder', e);
    }
  },

  /** Futur : remplacer load/save par des appels Firebase/Supabase ici */
};

/* ═══════════════════════════════════════════════
   STRUCTURE PAR DÉFAUT D'UN UTILISATEUR
═══════════════════════════════════════════════ */
function defaultUser() {
  return {
    badges: [],
    stats: {
      activitiesViewed: 0,
      searchesDone:     0,
      planningCreated:  0,
      bafaStarted:      false,
      daysVisited:      0,
    },
    meta: {
      createdAt:   new Date().toISOString(),
      lastVisitDay: null,  // 'YYYY-MM-DD'
      version:     2,
    },
  };
}

/* ═══════════════════════════════════════════════
   CLASSE PRINCIPALE
═══════════════════════════════════════════════ */
class BadgesManager {
  constructor() {
    this.user    = this._loadOrCreate();
    this._trackDailyVisit();
  }

  /* ─── Persistance ─────────────────────────── */

  _loadOrCreate() {
    const saved = StorageAdapter.load();
    if (!saved) return defaultUser();

    // Migration v1 → v2 : assurer que toutes les clés existent
    const user = defaultUser();
    if (saved.badges)       user.badges      = saved.badges;
    if (saved.stats)        Object.assign(user.stats, saved.stats);
    if (saved.meta)         Object.assign(user.meta,  saved.meta);
    return user;
  }

  _save() {
    StorageAdapter.save(this.user);
  }

  /* ─── Suivi de la visite quotidienne ──────── */

  _trackDailyVisit() {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    if (this.user.meta.lastVisitDay !== today) {
      this.user.meta.lastVisitDay = today;
      this.user.stats.daysVisited = (this.user.stats.daysVisited || 0) + 1;
      this._checkAndAward();
      this._save();
    }
  }

  /* ─── Tracking d'événements ───────────────── */

  /**
   * Méthode publique à appeler depuis les autres modules.
   * @param {'activityViewed'|'searchDone'|'planningCreated'|'bafaStarted'} event
   */
  trackEvent(event) {
    switch (event) {
      case 'activityViewed':
        this.user.stats.activitiesViewed++;
        break;
      case 'searchDone':
        this.user.stats.searchesDone++;
        break;
      case 'planningCreated':
        this.user.stats.planningCreated++;
        break;
      case 'bafaStarted':
        this.user.stats.bafaStarted = true;
        break;
      default:
        console.warn(`BadgesManager : événement inconnu "${event}"`);
        return;
    }

    this._checkAndAward();
    this._save();
  }

  /* ─── Attribution des badges ──────────────── */

  _checkAndAward() {
    BADGES_CONFIG.forEach(badge => {
      if (this.user.badges.includes(badge.id)) return; // déjà obtenu

      const earned = badge.condition(this.user.stats, this.user.badges);
      if (earned) {
        this.user.badges.push(badge.id);
        this._notifyNewBadge(badge);
        // Re-check "collectionneur" après chaque nouveau badge
        this._checkCollectionneur();
      }
    });
  }

  _checkCollectionneur() {
    const badge = BADGES_CONFIG.find(b => b.id === 'collectionneur');
    if (!badge || this.user.badges.includes(badge.id)) return;
    if (badge.condition(this.user.stats, this.user.badges)) {
      this.user.badges.push(badge.id);
      this._notifyNewBadge(badge);
    }
  }

  /* ─── Notification nouveau badge ──────────── */

  _notifyNewBadge(badge) {
    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      background:#fff;border-radius:16px;padding:14px 20px;
      box-shadow:0 8px 32px rgba(0,0,0,.15);
      display:flex;align-items:center;gap:12px;
      font-family:inherit;font-size:.95rem;
      animation:slideInToast .35s cubic-bezier(.34,1.56,.64,1);
      max-width:320px;
    `;
    toast.innerHTML = `
      <div style="width:44px;height:44px;border-radius:50%;background:${badge.color};
                  display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">
        ${badge.emoji}
      </div>
      <div>
        <div style="font-weight:700;color:#1d1d1f;">🏅 Badge débloqué !</div>
        <div style="color:#6e6e73;font-size:.85rem;">${badge.label}</div>
      </div>
    `;

    // Injecter l'animation si besoin
    if (!document.getElementById('toastKeyframes')) {
      const style = document.createElement('style');
      style.id = 'toastKeyframes';
      style.textContent = `
        @keyframes slideInToast {
          from { opacity:0; transform:translateY(20px) scale(.9); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity .3s, transform .3s';
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  /* ─── API publique (lecture) ──────────────── */

  /** @returns {{ earned: object[], locked: object[] }} */
  getAllBadges() {
    return BADGES_CONFIG.map(badge => ({
      ...badge,
      earned:   this.user.badges.includes(badge.id),
      progress: this._getProgress(badge),
    }));
  }

  _getProgress(badge) {
    if (!badge.threshold) return null;
    const { stat, target } = badge.threshold;
    const value = this.user.stats[stat] || 0;
    return { value, target, pct: Math.min(100, Math.round((value / target) * 100)) };
  }

  getStats() {
    return { ...this.user.stats };
  }

  /** Rendu inline d'un mini widget de progression (utilisé dans badges.html) */
  renderBadgesPage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const all = this.getAllBadges();
    const earned = all.filter(b => b.earned);
    const locked = all.filter(b => !b.earned);

    const buildCard = (badge) => {
      const prog = badge.progress;
      const progressBar = prog
        ? `<div style="margin-top:10px;">
             <div style="display:flex;justify-content:space-between;font-size:.75rem;color:#6e6e73;margin-bottom:4px;">
               <span>${prog.value} / ${prog.target}</span><span>${prog.pct}%</span>
             </div>
             <div style="height:6px;background:#f2f2f7;border-radius:3px;overflow:hidden;">
               <div style="height:100%;width:${prog.pct}%;background:${badge.color};border-radius:3px;transition:width .6s ease;"></div>
             </div>
           </div>`
        : '';

      return `
        <div class="reglem-fiche" style="${badge.earned ? '' : 'opacity:.5;filter:grayscale(.7);'}">
          <div class="reglem-fiche-header" style="background:${badge.color};">
            <span class="reglem-fiche-emoji" style="font-size:1.6rem;">${badge.emoji}</span>
            <div>
              <h3>${badge.label}</h3>
              <span class="reglem-fiche-tag">${badge.earned ? '✅ Obtenu' : '🔒 Verrouillé'}</span>
            </div>
          </div>
          <div class="reglem-fiche-body">
            <p style="font-size:.9rem;">${badge.desc}</p>
            ${progressBar}
          </div>
        </div>`;
    };

    container.innerHTML = `
      ${earned.length > 0 ? `
        <div class="reglem-intro"><h2>🏅 Mes badges (${earned.length}/${all.length})</h2></div>
        <div class="reglem-cards-grid" style="margin-bottom:48px;">
          ${earned.map(buildCard).join('')}
        </div>` : ''}
      <div class="reglem-intro">
        <h2>${earned.length === 0 ? '🔒 Badges à débloquer' : '🔒 À débloquer'}</h2>
      </div>
      <div class="reglem-cards-grid">
        ${locked.map(buildCard).join('')}
      </div>`;
  }
}

/* ═══════════════════════════════════════════════
   AUTO-INIT — toutes les pages
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  window.badgesManager = new BadgesManager();

  // Si on est sur badges.html, déclencher le rendu
  if (window.location.pathname.includes('badges.html')) {
    window.badgesManager.renderBadgesPage('badgesContainer');
  }
});
