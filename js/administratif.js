/**
 * ANIM'TOOLS — MODULE ADMINISTRATIF
 * Gère le profil animateur, le parcours BAFA, les formations
 * complémentaires, les notes et les documents.
 * Stockage : localStorage. Prêt pour migration Firebase/Supabase.
 *
 * Exposition globale : window.administratifModule
 */

/* ═══════════════════════════════════════════════
   COUCHE STOCKAGE
═══════════════════════════════════════════════ */
const AdminStorage = {
  KEY: 'animtools_admin',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('AdministratifModule : sauvegarde impossible', e);
    }
  },
};

/* ═══════════════════════════════════════════════
   DONNÉES PAR DÉFAUT
═══════════════════════════════════════════════ */
function defaultAdminData() {
  return {
    profil: {
      prenom:       '',
      nom:          '',
      email:        '',
      role:         'animateur',
      experience:   '',
      structure:    '',
    },
    bafa: {
      stages: [
        {
          id:       'formation_generale',
          label:    'Formation générale',
          emoji:    '📚',
          color:    'linear-gradient(135deg,#667EEA,#764BA2)',
          status:   'pending',   // 'pending' | 'in_progress' | 'done'
          dateDebut: '',
          dateFin:   '',
          lieu:      '',
          notes:     '',
        },
        {
          id:       'stage_pratique',
          label:    'Stage pratique',
          emoji:    '🏕️',
          color:    'linear-gradient(135deg,#F093FB,#F5576C)',
          status:   'pending',
          dateDebut: '',
          dateFin:   '',
          lieu:      '',
          notes:     '',
        },
        {
          id:       'approfondissement',
          label:    'Stage d\'approfondissement',
          emoji:    '🎓',
          color:    'linear-gradient(135deg,#43E97B,#38F9D7)',
          status:   'pending',
          dateDebut: '',
          dateFin:   '',
          lieu:      '',
          notes:     '',
        },
      ],
    },
    formations: [],   // { id, label, date, organisme, notes }
    noteLibre:  '',
    meta: {
      createdAt: new Date().toISOString(),
      version:   1,
    },
  };
}

/* ═══════════════════════════════════════════════
   CLASSE PRINCIPALE
═══════════════════════════════════════════════ */
class AdministratifModule {
  constructor() {
    this.data = this._loadOrCreate();
    this._formationIdCounter = this.data.formations.length;
  }

  /* ─── Persistance ─────────────────────────── */

  _loadOrCreate() {
    const saved = AdminStorage.load();
    if (!saved) return defaultAdminData();

    // Fusion douce pour éviter les clés manquantes
    const base = defaultAdminData();
    if (saved.profil)     Object.assign(base.profil, saved.profil);
    if (saved.bafa?.stages) {
      saved.bafa.stages.forEach((s, i) => {
        if (base.bafa.stages[i]) Object.assign(base.bafa.stages[i], s);
      });
    }
    if (saved.formations)  base.formations  = saved.formations;
    if (saved.noteLibre !== undefined) base.noteLibre = saved.noteLibre;
    if (saved.meta)        Object.assign(base.meta, saved.meta);
    return base;
  }

  save() {
    AdminStorage.save(this.data);
    this._showSaveIndicator();
  }

  /* ─── Init principal ──────────────────────── */

  async init() {
    if (!document.getElementById('adminContent')) return;

    this._renderAll();
    this._bindEvents();
    console.log('⚙️ AdministratifModule initialisé');
  }

  _renderAll() {
    this._renderProfil();
    this._renderBafa();
    this._renderFormations();
    this._renderNotes();
  }

  /* ═══════════════════════════════════════════
     SECTION PROFIL
  ═══════════════════════════════════════════ */

  _renderProfil() {
    const section = document.getElementById('profilSection');
    if (!section) return;

    const { prenom, nom, email, role, experience, structure } = this.data.profil;
    const initiales = `${prenom[0] || '?'}${nom[0] || ''}`.toUpperCase();

    section.innerHTML = `
      <div class="reglem-table-block" style="padding:28px;">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;">
          <div id="profilAvatar" style="
            width:64px;height:64px;border-radius:50%;
            background:linear-gradient(135deg,#667EEA,#764BA2);
            color:#fff;font-size:1.4rem;font-weight:800;
            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${initiales}
          </div>
          <div>
            <h3 style="font-size:1.1rem;font-weight:700;margin:0;">${prenom || 'Mon'} ${nom || 'Profil'}</h3>
            <p style="margin:4px 0 0;color:var(--color-tertiary);font-size:.9rem;">${role || 'Animateur'}</p>
          </div>
        </div>
        <div class="admin-form-grid">
          <div class="filter-group">
            <label class="filter-label" for="pPrenom">Prénom</label>
            <input class="filter-input" type="text" id="pPrenom" placeholder="Votre prénom" value="${this._esc(prenom)}">
          </div>
          <div class="filter-group">
            <label class="filter-label" for="pNom">Nom</label>
            <input class="filter-input" type="text" id="pNom" placeholder="Votre nom" value="${this._esc(nom)}">
          </div>
          <div class="filter-group">
            <label class="filter-label" for="pEmail">Email</label>
            <input class="filter-input" type="email" id="pEmail" placeholder="vous@exemple.fr" value="${this._esc(email)}">
          </div>
          <div class="filter-group">
            <label class="filter-label" for="pRole">Rôle</label>
            <select class="filter-select" id="pRole">
              ${['animateur','animateur principal','directeur','stagiaire BAFA','bénévole'].map(r =>
                `<option value="${r}"${role===r?' selected':''}>${r.charAt(0).toUpperCase()+r.slice(1)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label" for="pExperience">Expérience</label>
            <input class="filter-input" type="text" id="pExperience" placeholder="ex : 2 ans" value="${this._esc(experience)}">
          </div>
          <div class="filter-group">
            <label class="filter-label" for="pStructure">Structure / Employeur</label>
            <input class="filter-input" type="text" id="pStructure" placeholder="Nom de la structure" value="${this._esc(structure)}">
          </div>
        </div>
        <div style="margin-top:20px;">
          <button class="btn btn-primary" id="saveProfil">💾 Sauvegarder le profil</button>
        </div>
      </div>`;
  }

  _bindProfilEvents() {
    document.getElementById('saveProfil')?.addEventListener('click', () => {
      this.data.profil.prenom      = document.getElementById('pPrenom')?.value     || '';
      this.data.profil.nom         = document.getElementById('pNom')?.value        || '';
      this.data.profil.email       = document.getElementById('pEmail')?.value      || '';
      this.data.profil.role        = document.getElementById('pRole')?.value       || '';
      this.data.profil.experience  = document.getElementById('pExperience')?.value || '';
      this.data.profil.structure   = document.getElementById('pStructure')?.value  || '';
      this.save();
      this._renderProfil();
      this._bindProfilEvents();

      // Tracking badge BAFA si email rempli
      if (this.data.profil.email) {
        window.badgesManager?.trackEvent('bafaStarted');
      }
    });
  }

  /* ═══════════════════════════════════════════
     SECTION BAFA
  ═══════════════════════════════════════════ */

  _renderBafa() {
    const section = document.getElementById('bafaSection');
    if (!section) return;

    const stages = this.data.bafa.stages;
    const doneCount = stages.filter(s => s.status === 'done').length;

    const statusLabel = { pending: 'À faire', in_progress: 'En cours', done: 'Validé' };
    const statusColor = { pending: '#6e6e73', in_progress: '#F5A623', done: '#34C759' };

    section.innerHTML = `
      <div class="reglem-table-block" style="padding:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="margin:0;font-size:1rem;font-weight:700;">Progression BAFA</h3>
            <p style="margin:4px 0 0;color:var(--color-tertiary);font-size:.85rem;">${doneCount} étape${doneCount!==1?'s':''} validée${doneCount!==1?'s':''} sur ${stages.length}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.6rem;font-weight:800;color:var(--color-accent);">${Math.round((doneCount/stages.length)*100)}%</div>
          </div>
        </div>

        <!-- Barre de progression globale -->
        <div style="height:8px;background:#f2f2f7;border-radius:4px;overflow:hidden;margin-bottom:28px;">
          <div style="height:100%;width:${Math.round((doneCount/stages.length)*100)}%;background:linear-gradient(90deg,#667EEA,#764BA2);border-radius:4px;transition:width .6s ease;"></div>
        </div>

        <!-- Étapes -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${stages.map((stage, idx) => `
            <div class="reglem-fiche" style="box-shadow:none;border:1.5px solid #f2f2f7;">
              <div class="reglem-fiche-header" style="background:${stage.color};cursor:pointer;user-select:none;"
                onclick="this.closest('.reglem-fiche').querySelector('.bafa-stage-body').toggleAttribute('hidden')">
                <span class="reglem-fiche-emoji">${stage.emoji}</span>
                <div style="flex:1;">
                  <h3>${stage.label}</h3>
                  <span class="reglem-fiche-tag" style="background:${statusColor[stage.status]};">
                    ${statusLabel[stage.status]}
                  </span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div class="bafa-stage-body reglem-fiche-body" ${stage.status === 'pending' && idx !== 0 ? 'hidden' : ''}>
                <div class="admin-form-grid" style="grid-template-columns:1fr 1fr;">
                  <div class="filter-group">
                    <label class="filter-label">Statut</label>
                    <select class="filter-select bafa-status" data-stage="${stage.id}">
                      <option value="pending"     ${stage.status==='pending'     ?'selected':''}>À faire</option>
                      <option value="in_progress" ${stage.status==='in_progress' ?'selected':''}>En cours</option>
                      <option value="done"        ${stage.status==='done'        ?'selected':''}>Validé ✅</option>
                    </select>
                  </div>
                  <div class="filter-group">
                    <label class="filter-label">Lieu / Organisme</label>
                    <input class="filter-input bafa-lieu" data-stage="${stage.id}" type="text" placeholder="ex : UFCV Paris" value="${this._esc(stage.lieu)}">
                  </div>
                  <div class="filter-group">
                    <label class="filter-label">Date de début</label>
                    <input class="filter-input bafa-debut" data-stage="${stage.id}" type="date" value="${stage.dateDebut}">
                  </div>
                  <div class="filter-group">
                    <label class="filter-label">Date de fin</label>
                    <input class="filter-input bafa-fin" data-stage="${stage.id}" type="date" value="${stage.dateFin}">
                  </div>
                </div>
                <div class="filter-group" style="margin-top:8px;">
                  <label class="filter-label">Notes</label>
                  <textarea class="filter-input bafa-notes" data-stage="${stage.id}"
                    rows="2" style="resize:vertical;font-size:.9rem;"
                    placeholder="Observations, contacts, infos pratiques...">${this._esc(stage.notes)}</textarea>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;">
          <button class="btn btn-primary" id="saveBafa">💾 Sauvegarder le BAFA</button>
        </div>
      </div>`;
  }

  _bindBafaEvents() {
    document.getElementById('saveBafa')?.addEventListener('click', () => {
      this.data.bafa.stages.forEach(stage => {
        const sel    = document.querySelector(`.bafa-status[data-stage="${stage.id}"]`);
        const lieu   = document.querySelector(`.bafa-lieu[data-stage="${stage.id}"]`);
        const debut  = document.querySelector(`.bafa-debut[data-stage="${stage.id}"]`);
        const fin    = document.querySelector(`.bafa-fin[data-stage="${stage.id}"]`);
        const notes  = document.querySelector(`.bafa-notes[data-stage="${stage.id}"]`);

        if (sel)   stage.status    = sel.value;
        if (lieu)  stage.lieu      = lieu.value;
        if (debut) stage.dateDebut = debut.value;
        if (fin)   stage.dateFin   = fin.value;
        if (notes) stage.notes     = notes.value;
      });

      // Tracker le badge si au moins une étape commencée
      const started = this.data.bafa.stages.some(s => s.status !== 'pending');
      if (started) window.badgesManager?.trackEvent('bafaStarted');

      this.save();
      this._renderBafa();
      this._bindBafaEvents();
    });
  }

  /* ═══════════════════════════════════════════
     SECTION FORMATIONS COMPLÉMENTAIRES
  ═══════════════════════════════════════════ */

  _renderFormations() {
    const section = document.getElementById('formationsSection');
    if (!section) return;

    const SUGGESTIONS = ['PSC1','PSC2','BPJEPS','CPJEPS','AFPS','Secourisme','Gestes premiers secours'];

    section.innerHTML = `
      <div class="reglem-table-block" style="padding:28px;">
        <div style="margin-bottom:20px;">
          <h3 style="font-size:1rem;font-weight:700;margin:0 0 4px;">Ajouter une formation</h3>
          <p style="font-size:.85rem;color:var(--color-tertiary);margin:0;">PSC1, BPJEPS, CPJEPS, formations spécifiques…</p>
        </div>
        <div class="admin-form-grid">
          <div class="filter-group">
            <label class="filter-label">Intitulé</label>
            <input class="filter-input" id="fLabel" type="text" list="formationSuggestions" placeholder="Nom de la formation">
            <datalist id="formationSuggestions">
              ${SUGGESTIONS.map(s => `<option value="${s}">`).join('')}
            </datalist>
          </div>
          <div class="filter-group">
            <label class="filter-label">Date d'obtention</label>
            <input class="filter-input" id="fDate" type="date">
          </div>
          <div class="filter-group">
            <label class="filter-label">Organisme</label>
            <input class="filter-input" id="fOrganisme" type="text" placeholder="ex : Croix-Rouge">
          </div>
          <div class="filter-group">
            <label class="filter-label">Notes</label>
            <input class="filter-input" id="fNotes" type="text" placeholder="Durée, lieu, commentaire…">
          </div>
        </div>
        <button class="btn btn-primary" id="addFormation" style="margin-top:12px;">➕ Ajouter</button>

        <!-- Liste des formations -->
        <div id="formationsList" style="margin-top:24px;">
          ${this._buildFormationsList()}
        </div>
      </div>`;
  }

  _buildFormationsList() {
    if (this.data.formations.length === 0) {
      return `<p style="color:var(--color-tertiary);font-size:.9rem;text-align:center;padding:16px 0;">
                Aucune formation ajoutée pour l'instant.
              </p>`;
    }

    return `<table class="reglem-table" style="width:100%;">
      <thead>
        <tr>
          <th>Formation</th>
          <th>Date</th>
          <th>Organisme</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${this.data.formations.map(f => `
          <tr>
            <td><strong>${this._esc(f.label)}</strong></td>
            <td>${f.date ? new Date(f.date).toLocaleDateString('fr-FR') : '—'}</td>
            <td>${this._esc(f.organisme) || '—'}</td>
            <td style="font-size:.85rem;color:var(--color-tertiary);">${this._esc(f.notes) || '—'}</td>
            <td>
              <button class="btn-reset-checklist" style="padding:4px 10px;font-size:.8rem;"
                onclick="window.administratifModule.removeFormation('${f.id}')">🗑️</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  }

  addFormation() {
    const label    = document.getElementById('fLabel')?.value?.trim();
    const date     = document.getElementById('fDate')?.value;
    const organisme = document.getElementById('fOrganisme')?.value?.trim();
    const notes    = document.getElementById('fNotes')?.value?.trim();

    if (!label) {
      this._toast('⚠️ Indiquez au moins le nom de la formation', '#F5A623');
      return;
    }

    this.data.formations.push({
      id: `f_${Date.now()}`,
      label,
      date,
      organisme,
      notes,
    });

    this.save();

    // Reset champs
    ['fLabel','fDate','fOrganisme','fNotes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // Refresh liste seulement
    const listEl = document.getElementById('formationsList');
    if (listEl) listEl.innerHTML = this._buildFormationsList();
  }

  removeFormation(id) {
    this.data.formations = this.data.formations.filter(f => f.id !== id);
    this.save();
    const listEl = document.getElementById('formationsList');
    if (listEl) listEl.innerHTML = this._buildFormationsList();
  }

  _bindFormationsEvents() {
    document.getElementById('addFormation')?.addEventListener('click', () => {
      this.addFormation();
    });
  }

  /* ═══════════════════════════════════════════
     SECTION NOTES LIBRES
  ═══════════════════════════════════════════ */

  _renderNotes() {
    const section = document.getElementById('notesSection');
    if (!section) return;

    section.innerHTML = `
      <div class="reglem-table-block" style="padding:28px;">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 16px;">📝 Notes administratives</h3>
        <textarea id="noteLibre" rows="8"
          class="filter-input"
          style="width:100%;resize:vertical;font-size:.9rem;font-family:inherit;line-height:1.6;"
          placeholder="Contacts, rappels, références légales, numéros utiles, notes personnelles…"
        >${this._esc(this.data.noteLibre)}</textarea>
        <div style="margin-top:12px;display:flex;align-items:center;gap:12px;">
          <button class="btn btn-primary" id="saveNotes">💾 Sauvegarder</button>
          <span id="notesSavedAt" style="font-size:.8rem;color:var(--color-tertiary);"></span>
        </div>
      </div>`;
  }

  _bindNotesEvents() {
    document.getElementById('saveNotes')?.addEventListener('click', () => {
      this.data.noteLibre = document.getElementById('noteLibre')?.value || '';
      this.save();
      const indicator = document.getElementById('notesSavedAt');
      if (indicator) {
        indicator.textContent = `Sauvegardé à ${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`;
      }
    });

    // Auto-save au bout de 2s sans frappe
    let timer;
    document.getElementById('noteLibre')?.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        this.data.noteLibre = document.getElementById('noteLibre')?.value || '';
        AdminStorage.save(this.data);
        const indicator = document.getElementById('notesSavedAt');
        if (indicator) indicator.textContent = 'Sauvegarde automatique ✓';
      }, 2000);
    });
  }

  /* ═══════════════════════════════════════════
     BIND TOUS LES ÉVÉNEMENTS
  ═══════════════════════════════════════════ */

  _bindEvents() {
    this._bindProfilEvents();
    this._bindBafaEvents();
    this._bindFormationsEvents();
    this._bindNotesEvents();
  }

  /* ═══════════════════════════════════════════
     UTILITAIRES
  ═══════════════════════════════════════════ */

  _showSaveIndicator() {
    this._toast('✅ Données sauvegardées', '#34C759');
  }

  _toast(msg, color = '#34C759') {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      background:${color};color:#fff;border-radius:12px;
      padding:12px 20px;font-size:.9rem;font-weight:600;
      box-shadow:0 4px 16px rgba(0,0,0,.2);
      animation:slideInToast .3s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
}

/* ═══════════════════════════════════════════════
   AUTO-INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  window.administratifModule = new AdministratifModule();
  await window.administratifModule.init();
});
