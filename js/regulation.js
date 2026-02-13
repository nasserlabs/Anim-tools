/**
 * Anim'Tools – Module Réglementation
 * Gère : onglets, accordéon, checklist, quiz interactif
 */

const RegulationModule = (function () {

  /* ─────────────────────────────────────────────────────────────────
   * QUIZ DATA
   * ───────────────────────────────────────────────────────────────── */
  const QUIZ_QUESTIONS = [
    {
      q: "Quel est le taux d'encadrement pour les moins de 6 ans en accueil périscolaire ?",
      options: ['1 animateur pour 6 enfants', '1 animateur pour 8 enfants', '1 animateur pour 12 enfants', '1 animateur pour 14 enfants'],
      correct: 0,
      explanation: "En périscolaire, pour les moins de 6 ans, le ratio légal est de 1 animateur pour 6 enfants (Article R227-16 du CASF)."
    },
    {
      q: "En centre de loisirs extrascolaire, quel ratio s'applique pour les 6 ans et plus ?",
      options: ['1 pour 6', '1 pour 8', '1 pour 12', '1 pour 14'],
      correct: 2,
      explanation: "En extrascolaire (vacances, mercredis), le taux est de 1 animateur pour 12 enfants de 6 ans et plus."
    },
    {
      q: "Qu'est-ce qu'un PAI dans le contexte d'un ACM ?",
      options: ["Plan d'Animation Innovant", "Projet d'Accueil Individualisé", "Programme Annuel d'Intervention", "Protocole d'Aide Immédiate"],
      correct: 1,
      explanation: "Le PAI (Projet d'Accueil Individualisé) est un document établi avec la famille pour gérer les traitements médicaux ou allergies d'un enfant."
    },
    {
      q: "Quel numéro appeler en cas d'urgence médicale en France ?",
      options: ['17', '18', '15', '112'],
      correct: 2,
      explanation: "Le 15 est le SAMU, spécialisé pour les urgences médicales. Le 18 (pompiers) et le 112 (urgences Europe) peuvent aussi être appelés."
    },
    {
      q: "Quelle est la durée minimale du stage pratique du BAFA ?",
      options: ['8 jours', '10 jours', '14 jours', '21 jours'],
      correct: 2,
      explanation: "Le stage pratique du BAFA doit durer au minimum 14 jours, consécutifs ou non, dans une structure agréée."
    },
    {
      q: "Un animateur peut-il administrer un médicament sans ordonnance à un enfant ?",
      options: ["Oui, en cas d'urgence", 'Non, jamais sans ordonnance et autorisation parentale', "Oui si les parents ont appelé", 'Oui pour les médicaments courants'],
      correct: 1,
      explanation: "Aucun médicament ne peut être administré sans ordonnance médicale ET autorisation parentale écrite. C'est une obligation légale."
    },
    {
      q: "Que signifie l'acronyme ACM ?",
      options: ["Association des Centres de Musique", "Accueil Collectif de Mineurs", "Animation et Culture des Mineurs", "Agrément Centre Municipal"],
      correct: 1,
      explanation: "ACM signifie Accueil Collectif de Mineurs. C'est le terme officiel pour désigner les centres de loisirs, colonies, accueils périscolaires."
    },
    {
      q: "À partir de quel âge peut-on s'inscrire en BAFA ?",
      options: ['16 ans', '17 ans', '18 ans', '15 ans avec accord parental'],
      correct: 1,
      explanation: "Il faut avoir au moins 17 ans révolus pour s'inscrire et commencer le parcours BAFA."
    },
    {
      q: "Un exercice d'évacuation incendie est obligatoire…",
      options: ["Une fois par an", "Dans les 3 premiers mois de chaque session", "Tous les 6 mois", "À chaque nouveau groupe d'enfants"],
      correct: 1,
      explanation: "La réglementation impose un exercice d'évacuation dans les 3 premiers mois de chaque nouvelle session ou rentrée."
    },
    {
      q: "Quel document doit obligatoirement être remis avant une sortie extérieure ?",
      options: ["Contrat de sortie", "Autorisation parentale", "Certificat médical", "Attestation d'assurance"],
      correct: 1,
      explanation: "Une autorisation parentale signée est obligatoire pour toute sortie hors du lieu d'accueil. Sans elle, l'enfant ne peut participer à la sortie."
    }
  ];

  /* ─────────────────────────────────────────────────────────────────
   * ÉTAT QUIZ
   * ───────────────────────────────────────────────────────────────── */
  let quizState = {
    currentQ: 0,
    score: 0,
    answered: false,
    finished: false,
    responses: []
  };

  /* ─────────────────────────────────────────────────────────────────
   * ONGLETS PRINCIPAUX
   * ───────────────────────────────────────────────────────────────── */
  function initTabs() {
    const tabs = document.querySelectorAll('.reglem-tab');
    const panels = document.querySelectorAll('.reglem-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) {
          target.classList.add('active');
          // Lancer le quiz si onglet quiz
          if (tab.dataset.tab === 'quiz' && !quizState.finished) {
            renderQuiz();
          }
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * FICHES CLIQUABLES (encadrement)
   * ───────────────────────────────────────────────────────────────── */
  function initFiches() {
    document.querySelectorAll('.reglem-fiche').forEach(fiche => {
      fiche.addEventListener('click', () => {
        const id = fiche.dataset.fiche;
        const detail = document.getElementById('detail-' + id);
        const isOpen = fiche.classList.contains('open');

        // Fermer toutes les fiches
        document.querySelectorAll('.reglem-fiche').forEach(f => {
          f.classList.remove('open');
          const d = document.getElementById('detail-' + f.dataset.fiche);
          if (d) d.style.maxHeight = '0';
        });

        if (!isOpen && detail) {
          fiche.classList.add('open');
          detail.style.maxHeight = detail.scrollHeight + 'px';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * ACCORDÉON (sorties)
   * ───────────────────────────────────────────────────────────────── */
  function initAccordion() {
    document.querySelectorAll('.reglem-accordion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        // Fermer tous
        document.querySelectorAll('.reglem-accordion-btn').forEach(b => {
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
   * CHECKLIST (sorties)
   * ───────────────────────────────────────────────────────────────── */
  const CHECKLIST_STORAGE = 'animtools_sortie_checklist';

  function loadChecklist() {
    try {
      return JSON.parse(localStorage.getItem(CHECKLIST_STORAGE)) || {};
    } catch { return {}; }
  }

  function saveChecklist(state) {
    try {
      localStorage.setItem(CHECKLIST_STORAGE, JSON.stringify(state));
    } catch { }
  }

  function initChecklist() {
    const checkboxes = document.querySelectorAll('.reglem-checklist input[type="checkbox"]');
    if (!checkboxes.length) return;

    const stored = loadChecklist();

    checkboxes.forEach(cb => {
      if (stored[cb.dataset.key]) cb.checked = true;
      cb.addEventListener('change', () => {
        const state = loadChecklist();
        state[cb.dataset.key] = cb.checked;
        saveChecklist(state);
        updateChecklistProgress();
      });
    });

    updateChecklistProgress();

    const resetBtn = document.getElementById('resetChecklist');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        checkboxes.forEach(cb => { cb.checked = false; });
        saveChecklist({});
        updateChecklistProgress();
      });
    }
  }

  function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.reglem-checklist input[type="checkbox"]');
    const total = checkboxes.length;
    const done = Array.from(checkboxes).filter(cb => cb.checked).length;
    const pct = total > 0 ? (done / total * 100) : 0;

    const bar = document.getElementById('checkProgress');
    const label = document.getElementById('checkLabel');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = `${done} / ${total} éléments`;

    // Couleur dynamique
    if (bar) {
      if (pct === 100) bar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      else if (pct >= 60) bar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
      else bar.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
    }
  }

  /* ─────────────────────────────────────────────────────────────────
   * QUIZ
   * ───────────────────────────────────────────────────────────────── */
  function renderQuiz() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    if (quizState.finished) {
      renderQuizResults(container);
      return;
    }

    const q = QUIZ_QUESTIONS[quizState.currentQ];
    const progress = ((quizState.currentQ) / QUIZ_QUESTIONS.length * 100).toFixed(0);

    container.innerHTML = `
      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="quiz-progress-label">Question ${quizState.currentQ + 1} / ${QUIZ_QUESTIONS.length}</span>
      </div>

      <div class="quiz-question-card">
        <div class="quiz-question-num">Question ${quizState.currentQ + 1}</div>
        <h3 class="quiz-question-text">${q.q}</h3>

        <div class="quiz-options" id="quizOptions">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">
              <span class="quiz-opt-letter">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <div class="quiz-feedback" id="quizFeedback" style="display:none;"></div>

        <div class="quiz-nav" style="display:none;" id="quizNav">
          <button class="btn-quiz-next" id="quizNext">
            ${quizState.currentQ + 1 < QUIZ_QUESTIONS.length ? 'Question suivante →' : 'Voir mes résultats 🎯'}
          </button>
        </div>
      </div>
    `;

    // Gestion des réponses
    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (quizState.answered) return;
        quizState.answered = true;

        const chosen = parseInt(btn.dataset.index);
        const isCorrect = chosen === q.correct;

        if (isCorrect) quizState.score++;
        quizState.responses.push({ correct: isCorrect });

        // Afficher bonne/mauvaise réponse
        container.querySelectorAll('.quiz-option').forEach((b, i) => {
          if (i === q.correct) b.classList.add('correct');
          else if (i === chosen) b.classList.add('wrong');
          b.disabled = true;
        });

        // Feedback
        const feedback = document.getElementById('quizFeedback');
        if (feedback) {
          feedback.style.display = 'block';
          feedback.className = 'quiz-feedback ' + (isCorrect ? 'feedback-correct' : 'feedback-wrong');
          feedback.innerHTML = `
            <span>${isCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse.'}</span>
            <p>${q.explanation}</p>
          `;
        }

        document.getElementById('quizNav').style.display = 'block';
      });
    });

    // Bouton suivant
    document.getElementById('quizNext')?.addEventListener('click', () => {
      quizState.currentQ++;
      quizState.answered = false;
      if (quizState.currentQ >= QUIZ_QUESTIONS.length) {
        quizState.finished = true;
      }
      renderQuiz();
    });
  }

  function renderQuizResults(container) {
    const total = QUIZ_QUESTIONS.length;
    const score = quizState.score;
    const pct = Math.round(score / total * 100);

    let grade, gradeClass;
    if (pct >= 80) { grade = '🏆 Expert !'; gradeClass = 'grade-expert'; }
    else if (pct >= 60) { grade = '✅ Bon niveau'; gradeClass = 'grade-good'; }
    else if (pct >= 40) { grade = '📚 À revoir'; gradeClass = 'grade-medium'; }
    else { grade = '🔄 À améliorer'; gradeClass = 'grade-low'; }

    container.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results-header">
          <div class="quiz-results-score-ring">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" stroke-width="10"
                stroke-dasharray="${2 * Math.PI * 50}"
                stroke-dashoffset="${2 * Math.PI * 50 * (1 - pct / 100)}"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"/>
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#667EEA"/>
                  <stop offset="100%" stop-color="#764BA2"/>
                </linearGradient>
              </defs>
              <text x="60" y="60" text-anchor="middle" dominant-baseline="central" class="score-ring-text">${pct}%</text>
            </svg>
          </div>
          <div class="quiz-results-info">
            <div class="quiz-results-grade ${gradeClass}">${grade}</div>
            <p class="quiz-results-score">${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${total}</p>
            <p class="quiz-results-sub">Score : ${pct}%</p>
          </div>
        </div>

        <div class="quiz-results-breakdown">
          <h4>Récapitulatif</h4>
          ${quizState.responses.map((r, i) => `
            <div class="quiz-recap-item ${r.correct ? 'recap-ok' : 'recap-ko'}">
              <span>${r.correct ? '✅' : '❌'}</span>
              <span>Question ${i + 1} : ${QUIZ_QUESTIONS[i].q.substring(0, 50)}…</span>
            </div>
          `).join('')}
        </div>

        <button class="btn-quiz-restart" id="quizRestart">🔄 Recommencer le quiz</button>
      </div>
    `;

    document.getElementById('quizRestart')?.addEventListener('click', () => {
      quizState = { currentQ: 0, score: 0, answered: false, finished: false, responses: [] };
      renderQuiz();
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * INIT
   * ───────────────────────────────────────────────────────────────── */
  function init() {
    initTabs();
    initFiches();
    initAccordion();
    initChecklist();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
