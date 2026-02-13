/**
 * Anim'Tools – Module BAFA Roadmap
 * Gère la roadmap interactive du parcours BAFA
 * Données chargées depuis assets/data/bafa.json
 */

const BAFARoadmap = (function () {

  /* ── État ── */
  let data = null;
  let stageActif = null;
  const storageKey = 'animtools_bafa_progress';

  /* ── Éléments DOM ── */
  const $ = (id) => document.getElementById(id);

  /* ─────────────────────────────────────────────────────────────────
   * PERSISTANCE PROGRESSION
   * ───────────────────────────────────────────────────────────────── */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch { return {}; }
  }

  function setProgress(prog) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(prog));
    } catch { }
  }

  function toggleStageComplete(id) {
    const prog = getProgress();
    prog[id] = !prog[id];
    setProgress(prog);
  }

  function isComplete(id) {
    return !!getProgress()[id];
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER : ROADMAP
   * ───────────────────────────────────────────────────────────────── */
  function renderRoadmap() {
    const container = $('bafa-roadmap-steps');
    if (!container) return;

    container.innerHTML = data.stages.map((stage, i) => {
      const done = isComplete(stage.id);
      return `
        <div class="bafa-step ${done ? 'completed' : ''}" data-id="${stage.id}" tabindex="0" role="button" aria-label="Ouvrir ${stage.titre}">
          <div class="bafa-step-connector ${i === 0 ? 'first' : ''}"></div>
          <div class="bafa-step-bubble" style="background: linear-gradient(135deg, ${stage.couleur}, ${stage.couleur2})">
            <span class="bafa-step-emoji">${stage.emoji}</span>
            ${done ? '<span class="bafa-step-check">✓</span>' : ''}
          </div>
          <div class="bafa-step-info">
            <span class="bafa-step-num">${stage.soustitre}</span>
            <h3 class="bafa-step-title">${stage.titre}</h3>
            <div class="bafa-step-meta">
              <span>⏱ ${stage.duree}</span>
              <span>💶 ${stage.cout_moyen}</span>
            </div>
          </div>
          ${done ? '<div class="bafa-done-badge">Validé ✅</div>' : ''}
        </div>
      `;
    }).join('<div class="bafa-arrow">↓</div>');

    // Clic sur un step
    container.querySelectorAll('.bafa-step').forEach(el => {
      el.addEventListener('click', () => openPanel(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPanel(el.dataset.id); });
    });

    // Barre de progression globale
    updateGlobalProgress();
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER : PROGRESSION GLOBALE
   * ───────────────────────────────────────────────────────────────── */
  function updateGlobalProgress() {
    const total = data.stages.length;
    const done = data.stages.filter(s => isComplete(s.id)).length;
    const pct = Math.round((done / total) * 100);

    const bar = $('bafa-progress-fill');
    const label = $('bafa-progress-label');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = `${done} / ${total} étapes validées`;
  }

  /* ─────────────────────────────────────────────────────────────────
   * PANEL DE DÉTAIL
   * ───────────────────────────────────────────────────────────────── */
  function openPanel(stageId) {
    const stage = data.stages.find(s => s.id === stageId);
    if (!stage) return;

    stageActif = stageId;
    const panel = $('bafa-detail-panel');
    const done = isComplete(stageId);

    if (panel) {
      panel.classList.add('active');
      renderPanelContent(stage, done);

      // Scroll vers le panel
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function closePanel() {
    const panel = $('bafa-detail-panel');
    if (panel) panel.classList.remove('active');
    stageActif = null;
  }

  function renderPanelContent(stage, done) {
    const panel = $('bafa-detail-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="bafa-panel-inner">
        <button class="bafa-panel-close" id="closePanelBtn" aria-label="Fermer">✕</button>

        <div class="bafa-panel-header" style="background: linear-gradient(135deg, ${stage.couleur}, ${stage.couleur2})">
          <div class="bafa-panel-header-content">
            <span class="bafa-panel-emoji">${stage.emoji}</span>
            <div>
              <span class="bafa-panel-tag">${stage.soustitre}</span>
              <h2>${stage.titre}</h2>
              <p>${stage.description}</p>
            </div>
          </div>
          <div class="bafa-panel-meta-row">
            <span>⏱ ${stage.duree}</span>
            <span>💶 ${stage.cout_moyen}</span>
            <span>📍 ${stage.organisme_exemple}</span>
          </div>
        </div>

        <div class="bafa-panel-body">
          <div class="bafa-panel-tabs">
            <button class="bafa-ptab active" data-ptab="objectifs">🎯 Objectifs</button>
            <button class="bafa-ptab" data-ptab="competences">📊 Compétences</button>
            <button class="bafa-ptab" data-ptab="docs">📁 Documents</button>
            <button class="bafa-ptab" data-ptab="financement">💶 Financement</button>
            <button class="bafa-ptab" data-ptab="conseils">💡 Conseils</button>
          </div>

          <div class="bafa-ptab-content active" id="ptab-objectifs">
            <ul class="bafa-panel-list">
              ${stage.objectifs.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>

          <div class="bafa-ptab-content" id="ptab-competences">
            <div class="bafa-competences">
              ${stage.competences.map(c => `
                <div class="bafa-competence-row">
                  <span class="bafa-comp-label">${c.nom}</span>
                  <div class="bafa-comp-bar">
                    <div class="bafa-comp-fill" style="width: ${c.niveau}%; background: linear-gradient(90deg, ${stage.couleur}, ${stage.couleur2})"></div>
                  </div>
                  <span class="bafa-comp-pct">${c.niveau}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bafa-ptab-content" id="ptab-docs">
            <ul class="bafa-panel-list">
              ${stage.docs_requis.map(d => `<li>📄 ${d}</li>`).join('')}
            </ul>
          </div>

          <div class="bafa-ptab-content" id="ptab-financement">
            <div class="bafa-financement-grid">
              ${stage.financement.map(f => `
                <div class="bafa-fin-card">
                  <span class="bafa-fin-source">💰 ${f.source}</span>
                  <span class="bafa-fin-montant">${f.montant}</span>
                </div>
              `).join('')}
            </div>
            <p class="bafa-fin-note">💡 Renseignez-vous auprès de votre CAF locale pour les conditions exactes.</p>
          </div>

          <div class="bafa-ptab-content" id="ptab-conseils">
            <ul class="bafa-panel-list bafa-conseils-list">
              ${stage.conseils.map(c => `<li>💡 ${c}</li>`).join('')}
            </ul>
          </div>

        </div><!-- /panel-body -->

        <div class="bafa-panel-footer">
          <button class="btn-toggle-done ${done ? 'done' : ''}" id="toggleDoneBtn">
            ${done ? '✓ Étape validée — Cliquer pour annuler' : '🎯 Marquer cette étape comme validée'}
          </button>
        </div>

      </div>
    `;

    // Gestion onglets internes
    panel.querySelectorAll('.bafa-ptab').forEach(tab => {
      tab.addEventListener('click', () => {
        panel.querySelectorAll('.bafa-ptab').forEach(t => t.classList.remove('active'));
        panel.querySelectorAll('.bafa-ptab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = panel.querySelector(`#ptab-${tab.dataset.ptab}`);
        if (target) target.classList.add('active');

        // Animation barres de compétences
        if (tab.dataset.ptab === 'competences') {
          setTimeout(() => {
            panel.querySelectorAll('.bafa-comp-fill').forEach(fill => {
              fill.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            });
          }, 50);
        }
      });
    });

    // Bouton fermer
    $('closePanelBtn')?.addEventListener('click', closePanel);

    // Toggle validation
    $('toggleDoneBtn')?.addEventListener('click', () => {
      toggleStageComplete(stageActif);
      renderRoadmap();
      openPanel(stageActif); // re-render panel
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER : FAQ
   * ───────────────────────────────────────────────────────────────── */
  function renderFAQ() {
    const container = $('bafa-faq');
    if (!container || !data.faq) return;

    container.innerHTML = data.faq.map((item, i) => `
      <div class="bafa-faq-item">
        <button class="bafa-faq-btn" aria-expanded="false">
          <span>${item.q}</span>
          <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="bafa-faq-body">
          <p>${item.r}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.bafa-faq-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        // Fermer tous
        container.querySelectorAll('.bafa-faq-btn').forEach(b => {
          b.setAttribute('aria-expanded', 'false');
          b.nextElementSibling.style.maxHeight = '0';
        });
        if (!expanded) {
          btn.setAttribute('aria-expanded', 'true');
          btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + 'px';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * RENDER : APRÈS BAFA
   * ───────────────────────────────────────────────────────────────── */
  function renderApresBafa() {
    const container = $('bafa-apres');
    if (!container || !data.apres_bafa) return;

    container.innerHTML = data.apres_bafa.map(item => `
      <div class="bafa-apres-card">
        <span class="bafa-apres-icon">${item.icon}</span>
        <h3>${item.titre}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
  }

  /* ─────────────────────────────────────────────────────────────────
   * INIT
   * ───────────────────────────────────────────────────────────────── */
  async function init() {
    try {
      const res = await fetch('assets/data/bafa.json');
      if (!res.ok) throw new Error('Données BAFA introuvables');
      data = await res.json();

      renderRoadmap();
      renderFAQ();
      renderApresBafa();

      // Fermer panel en cliquant dehors
      document.addEventListener('click', (e) => {
        const panel = $('bafa-detail-panel');
        if (panel && panel.classList.contains('active') && !panel.contains(e.target)) {
          // Ne fermer que si le clic est hors du panel ET hors des steps
          const isStep = e.target.closest('.bafa-step');
          if (!isStep) closePanel();
        }
      });

    } catch (err) {
      console.error('[BAFARoadmap] Erreur :', err);
      const container = $('bafa-roadmap-steps');
      if (container) {
        container.innerHTML = '<p class="bafa-error">⚠️ Impossible de charger les données BAFA.</p>';
      }
    }
  }

  /* ── Démarrage ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { refresh: renderRoadmap };

})();
