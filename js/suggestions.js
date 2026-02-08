/**
 * ANIM'TOOLS - MODULE SUGGESTIONS
 * Suggestion d'activité du jour (1 fois par jour)
 * Stockage en localStorage avec la date
 */

class SuggestionsManager {
    constructor() {
        this.storageKey = 'animtools_daily_suggestion';
        this.activities = [];
        this.categories = [];
        this.currentSuggestion = null;
    }
    
    /**
     * Initialiser le module
     */
    async init() {
        await this.loadActivitiesData();
        this.currentSuggestion = this.getDailySuggestion();
        this.renderSuggestion();
        console.log('🍽️ Module Suggestions initialisé');
    }
    
    /**
     * Charger les données d'activités
     */
    async loadActivitiesData() {
        try {
            const response = await fetch('data/activities.json');
            const data = await response.json();
            this.activities = data.activities;
            this.categories = data.categories;
        } catch (error) {
            console.error('Erreur chargement activités:', error);
        }
    }
    
    /**
     * Obtenir la date du jour au format YYYY-MM-DD
     * @returns {string}
     */
    getTodayDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
    
    /**
     * Vérifier si la suggestion doit être mise à jour
     * @returns {boolean}
     */
    shouldUpdateSuggestion() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return true;
            
            const data = JSON.parse(saved);
            return data.date !== this.getTodayDate();
        } catch (error) {
            return true;
        }
    }
    
    /**
     * Obtenir la suggestion du jour
     * @returns {Object|null} Activité suggérée
     */
    getDailySuggestion() {
        if (this.activities.length === 0) return null;
        
        // Vérifier si on doit mettre à jour
        if (this.shouldUpdateSuggestion()) {
            // Générer une nouvelle suggestion
            const randomIndex = this.getSeededRandom();
            const activity = this.activities[randomIndex];
            
            // Sauvegarder
            const data = {
                date: this.getTodayDate(),
                activityId: activity.id
            };
            
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
            } catch (error) {
                console.error('Erreur sauvegarde suggestion:', error);
            }
            
            return activity;
        } else {
            // Charger la suggestion existante
            try {
                const saved = localStorage.getItem(this.storageKey);
                const data = JSON.parse(saved);
                return this.activities.find(a => a.id === data.activityId) || this.activities[0];
            } catch (error) {
                return this.activities[0];
            }
        }
    }
    
    /**
     * Générer un nombre aléatoire basé sur la date (déterministe)
     * Même résultat pour la même journée
     * @returns {number} Index de l'activité
     */
    getSeededRandom() {
        const today = this.getTodayDate();
        // Créer un seed à partir de la date
        let hash = 0;
        for (let i = 0; i < today.length; i++) {
            const char = today.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Utiliser le hash comme seed pour un nombre pseudo-aléatoire
        const random = Math.abs(Math.sin(hash) * 10000);
        return Math.floor(random % this.activities.length);
    }
    
    /**
     * Rendre la suggestion sur la page d'accueil
     */
    renderSuggestion() {
        const suggestionContainer = document.getElementById('dailySuggestion');
        if (!suggestionContainer || !this.currentSuggestion) return;
        
        const activity = this.currentSuggestion;
        const cat = this.categories.find(c => c.id === activity.category);
        const categoryColor = cat ? cat.color : '#667eea';
        
        const html = `
            <div class="suggestion-card" data-activity-id="${activity.id}">
                <div class="suggestion-header">
                    <div class="suggestion-badge">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span>Suggestion du jour</span>
                    </div>
                    <span class="suggestion-date">${this.formatDate(new Date())}</span>
                </div>
                
                <div class="suggestion-content" onclick="window.animTools?.openPeek(${activity.id})">
                    <div class="suggestion-image" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${this.adjustColor(categoryColor, -20)} 100%);">
                        <span class="suggestion-category">${cat ? cat.name : activity.category}</span>
                    </div>
                    
                    <div class="suggestion-info">
                        <h3 class="suggestion-title">${activity.title}</h3>
                        <p class="suggestion-description">${activity.description}</p>
                        
                        <div class="suggestion-meta">
                            <div class="suggestion-meta-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="8" cy="6" r="3"/>
                                    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
                                </svg>
                                ${activity.age}
                            </div>
                            <div class="suggestion-meta-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="8" cy="8" r="6"/>
                                    <path d="M8 4v4l2 2"/>
                                </svg>
                                ${activity.duration}
                            </div>
                            <div class="suggestion-meta-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="2" width="12" height="12" rx="2"/>
                                    <path d="M6 6h4M6 10h4"/>
                                </svg>
                                ${activity.difficulty}
                            </div>
                        </div>
                        
                        <button class="suggestion-cta btn btn-primary">
                            Voir les détails
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 12l4-4-4-4"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="suggestion-footer">
                    <p class="suggestion-hint">💡 Cette suggestion change tous les jours</p>
                </div>
            </div>
        `;
        
        suggestionContainer.innerHTML = html;
        
        // Animation d'apparition
        setTimeout(() => {
            const card = suggestionContainer.querySelector('.suggestion-card');
            if (card) {
                card.classList.add('animate-in');
            }
        }, 100);
    }
    
    /**
     * Formater une date
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
    
    /**
     * Ajuster une couleur (utilitaire)
     */
    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
}

// Instance globale
window.suggestionsManager = null;

// Initialiser au chargement (uniquement sur la page d'accueil)
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('dailySuggestion')) {
        window.suggestionsManager = new SuggestionsManager();
        await window.suggestionsManager.init();
    }
});
