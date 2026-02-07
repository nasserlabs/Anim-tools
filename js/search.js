/**
 * ANIM'TOOLS - MODULE DE RECHERCHE
 * Gestion de la barre de recherche et filtrage des activités
 */

class SearchModule {
    constructor() {
        this.searchOverlay = document.getElementById('searchOverlay');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchClose = document.getElementById('searchClose');
        
        this.activities = [];
        this.categories = [];
        
        this.init();
    }
    
    /**
     * Initialisation du module
     */
    async init() {
        await this.loadActivities();
        this.attachEventListeners();
    }
    
    /**
     * Chargement des données depuis activities.json
     */
    async loadActivities() {
        try {
            const response = await fetch('data/activities.json');
            const data = await response.json();
            this.activities = data.activities;
            this.categories = data.categories;
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            this.activities = [];
        }
    }
    
    /**
     * Attacher les événements
     */
    attachEventListeners() {
        // Ouvrir la recherche
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.openSearch());
        }
        
        // Fermer la recherche
        if (this.searchClose) {
            this.searchClose.addEventListener('click', () => this.closeSearch());
        }
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOverlay?.classList.contains('active')) {
                this.closeSearch();
            }
        });
        
        // Recherche en temps réel
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
        
        // Fermer en cliquant sur l'overlay
        if (this.searchOverlay) {
            this.searchOverlay.addEventListener('click', (e) => {
                if (e.target === this.searchOverlay) {
                    this.closeSearch();
                }
            });
        }
    }
    
    /**
     * Ouvrir l'overlay de recherche
     */
    openSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                this.searchInput?.focus();
            }, 100);
        }
    }
    
    /**
     * Fermer l'overlay de recherche
     */
    closeSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            if (this.searchInput) {
                this.searchInput.value = '';
            }
            
            if (this.searchResults) {
                this.searchResults.innerHTML = '';
            }
        }
    }
    
    /**
     * Effectuer une recherche
     * @param {string} query - Terme de recherche
     */
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.searchResults.innerHTML = '';
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        // Filtrer les activités
        const results = this.activities.filter(activity => {
            return (
                activity.title.toLowerCase().includes(searchTerm) ||
                activity.description.toLowerCase().includes(searchTerm) ||
                activity.category.toLowerCase().includes(searchTerm) ||
                activity.materials.some(m => m.toLowerCase().includes(searchTerm))
            );
        });
        
        this.displayResults(results, searchTerm);
    }
    
    /**
     * Afficher les résultats de recherche
     * @param {Array} results - Résultats trouvés
     * @param {string} searchTerm - Terme recherché
     */
    displayResults(results, searchTerm) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>Aucun résultat pour "${searchTerm}"</p>
                </div>
            `;
            return;
        }
        
        const html = results.map(activity => {
            const category = this.categories.find(c => c.id === activity.category);
            const categoryName = category ? category.name : activity.category;
            
            return `
                <div class="search-result-item" data-activity-id="${activity.id}">
                    <div class="search-result-title">${activity.title}</div>
                    <div class="search-result-meta">
                        ${categoryName} • ${activity.age} • ${activity.duration}
                    </div>
                </div>
            `;
        }).join('');
        
        this.searchResults.innerHTML = html;
        
        // Ajouter les événements de clic
        this.attachResultClickEvents();
    }
    
    /**
     * Gérer le clic sur un résultat
     */
    attachResultClickEvents() {
        const resultItems = this.searchResults.querySelectorAll('.search-result-item');
        
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const activityId = item.dataset.activityId;
                // Rediriger vers la page inventaire avec l'ID
                window.location.href = `inventaire.html?activity=${activityId}`;
            });
        });
    }
}

// Initialiser le module de recherche au chargement
document.addEventListener('DOMContentLoaded', () => {
    new SearchModule();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchModule;
}
