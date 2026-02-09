/**
 * ANIM'TOOLS - MODULE RÉGLEMENTATION
 * Gestion des accordéons, checklists et quiz BAFA
 */

class RegulationModule {
    constructor() {
        this.quizScore = 0;
        this.quizAnswers = {};
        this.init();
    }
    
    /**
     * Initialisation
     */
    init() {
        this.initAccordions();
        this.initChecklists();
        this.initQuiz();
        console.log('📋 Module Réglementation initialisé');
    }
    
    /**
     * Initialiser les accordéons
     */
    initAccordions() {
        const accordions = document.querySelectorAll('.regulation-accordion');
        
        accordions.forEach(accordion => {
            const header = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');
            
            header.addEventListener('click', () => {
                const isOpen = accordion.classList.contains('active');
                
                // Fermer tous les autres (comportement exclusif)
                document.querySelectorAll('.regulation-accordion.active').forEach(item => {
                    if (item !== accordion) {
                        item.classList.remove('active');
                        item.querySelector('.accordion-content').style.maxHeight = null;
                    }
                });
                
                // Toggle l'accordéon cliqué
                if (isOpen) {
                    accordion.classList.remove('active');
                    content.style.maxHeight = null;
                } else {
                    accordion.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }
    
    /**
     * Initialiser les checklists
     */
    initChecklists() {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateChecklistProgress(e.target);
            });
        });
        
        // Initialiser les barres de progression
        this.updateAllChecklistProgress();
    }
    
    /**
     * Mettre à jour la progression d'une checklist
     */
    updateChecklistProgress(checkbox) {
        const checklist = checkbox.closest('.regulation-checklist');
        if (!checklist) return;
        
        const progressBar = checklist.querySelector('.checklist-progress-fill');
        const progressText = checklist.querySelector('.checklist-progress-text');
        
        if (!progressBar || !progressText) return;
        
        const checkboxes = checklist.querySelectorAll('.checklist-item input[type="checkbox"]');
        const checked = checklist.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        const total = checkboxes.length;
        const percentage = Math.round((checked / total) * 100);
        
        progressBar.style.width = percentage + '%';
        progressText.textContent = `${checked}/${total} étapes complétées`;
        
        // Animation de célébration si tout est coché
        if (checked === total) {
            this.showCompletionMessage(checklist);
        }
    }
    
    /**
     * Mettre à jour toutes les barres de progression
     */
    updateAllChecklistProgress() {
        const checklists = document.querySelectorAll('.regulation-checklist');
        checklists.forEach(checklist => {
            const firstCheckbox = checklist.querySelector('.checklist-item input[type="checkbox"]');
            if (firstCheckbox) {
                this.updateChecklistProgress(firstCheckbox);
            }
        });
    }
    
    /**
     * Afficher un message de félicitations
     */
    showCompletionMessage(checklist) {
        const title = checklist.querySelector('.checklist-title');
        if (!title) return;
        
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = '🎉 Checklist complète !';
        
        title.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    /**
     * Initialiser le quiz BAFA
     */
    initQuiz() {
        const quizForm = document.getElementById('quizForm');
        if (!quizForm) return;
        
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkQuizAnswers();
        });
        
        // Réinitialiser le quiz
        const resetBtn = document.getElementById('resetQuiz');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetQuiz();
            });
        }
    }
    
    /**
     * Vérifier les réponses du quiz
     */
    checkQuizAnswers() {
        const questions = document.querySelectorAll('.quiz-question');
        let score = 0;
        const totalQuestions = questions.length;
        
        // Réponses correctes (à adapter selon les vraies questions)
        const correctAnswers = {
            q1: 'b', // Taux d'encadrement: 1 pour 12
            q2: 'a', // Trousse de secours: obligatoire
            q3: 'b', // Autorisation sortie: écrite
            q4: 'c', // Distance de surveillance: visuelle
            q5: 'a', // Protocole sanitaire: lavage mains
            q6: 'b', // Allergy: liste à jour
            q7: 'c', // Document: projet pédagogique
            q8: 'a'  // Responsabilité: civile
        };
        
        questions.forEach((question, index) => {
            const questionId = `q${index + 1}`;
            const selectedAnswer = question.querySelector('input[type="radio"]:checked');
            const feedbackDiv = question.querySelector('.quiz-feedback');
            
            if (!feedbackDiv) return;
            
            if (!selectedAnswer) {
                feedbackDiv.className = 'quiz-feedback quiz-warning';
                feedbackDiv.innerHTML = '⚠️ Pas de réponse sélectionnée';
                feedbackDiv.style.display = 'block';
                return;
            }
            
            const userAnswer = selectedAnswer.value;
            const isCorrect = userAnswer === correctAnswers[questionId];
            
            if (isCorrect) {
                score++;
                feedbackDiv.className = 'quiz-feedback quiz-correct';
                feedbackDiv.innerHTML = '✅ Bonne réponse !';
            } else {
                feedbackDiv.className = 'quiz-feedback quiz-incorrect';
                feedbackDiv.innerHTML = `❌ Réponse incorrecte. La bonne réponse est ${correctAnswers[questionId].toUpperCase()}.`;
            }
            
            feedbackDiv.style.display = 'block';
        });
        
        this.showQuizResults(score, totalQuestions);
    }
    
    /**
     * Afficher les résultats du quiz
     */
    showQuizResults(score, total) {
        const resultsDiv = document.getElementById('quizResults');
        if (!resultsDiv) return;
        
        const percentage = Math.round((score / total) * 100);
        let message = '';
        let messageClass = '';
        
        if (percentage >= 80) {
            message = '🎉 Excellent ! Tu maîtrises bien la réglementation !';
            messageClass = 'quiz-result-excellent';
        } else if (percentage >= 60) {
            message = '👍 Bien joué ! Quelques points à réviser.';
            messageClass = 'quiz-result-good';
        } else {
            message = '📚 Continue à réviser ! La réglementation est importante.';
            messageClass = 'quiz-result-needs-work';
        }
        
        resultsDiv.innerHTML = `
            <div class="quiz-result ${messageClass}">
                <h3>Résultat : ${score}/${total} (${percentage}%)</h3>
                <p>${message}</p>
                <button id="resetQuiz" class="btn btn-secondary">Recommencer le quiz</button>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Réattacher l'événement reset
        document.getElementById('resetQuiz').addEventListener('click', () => {
            this.resetQuiz();
        });
    }
    
    /**
     * Réinitialiser le quiz
     */
    resetQuiz() {
        // Décocher toutes les réponses
        document.querySelectorAll('.quiz-question input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Masquer tous les feedbacks
        document.querySelectorAll('.quiz-feedback').forEach(feedback => {
            feedback.style.display = 'none';
        });
        
        // Masquer les résultats
        const resultsDiv = document.getElementById('quizResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
        
        // Scroll vers le haut du quiz
        const quizForm = document.getElementById('quizForm');
        if (quizForm) {
            quizForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * Sauvegarder l'état de la checklist (localStorage)
     */
    saveChecklistState() {
        const checklists = document.querySelectorAll('.regulation-checklist');
        const state = {};
        
        checklists.forEach((checklist, index) => {
            const checkboxes = checklist.querySelectorAll('.checklist-item input[type="checkbox"]');
            state[`checklist-${index}`] = Array.from(checkboxes).map(cb => cb.checked);
        });
        
        try {
            localStorage.setItem('animtools_checklists', JSON.stringify(state));
        } catch (error) {
            console.error('Erreur sauvegarde checklists:', error);
        }
    }
    
    /**
     * Charger l'état de la checklist (localStorage)
     */
    loadChecklistState() {
        try {
            const saved = localStorage.getItem('animtools_checklists');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            const checklists = document.querySelectorAll('.regulation-checklist');
            
            checklists.forEach((checklist, index) => {
                const checkboxes = checklist.querySelectorAll('.checklist-item input[type="checkbox"]');
                const savedState = state[`checklist-${index}`];
                
                if (savedState) {
                    checkboxes.forEach((cb, cbIndex) => {
                        cb.checked = savedState[cbIndex] || false;
                    });
                }
            });
            
            this.updateAllChecklistProgress();
        } catch (error) {
            console.error('Erreur chargement checklists:', error);
        }
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.regulation-content')) {
        const regulationModule = new RegulationModule();
        
        // Charger l'état sauvegardé
        regulationModule.loadChecklistState();
        
        // Sauvegarder à chaque changement
        document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                regulationModule.saveChecklistState();
            });
        });
    }
});
