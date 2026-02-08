/**
 * ANIM'TOOLS - MODULE FAVORIS
 * Gestion des activités favorites avec localStorage
 * Synchronisation automatique sur toutes les vues
 */

class FavoritesManager {
    constructor() {
        this.storageKey = 'animtools_favorites';
        this.favorites = this.loadFavorites();
        this.activities = [];
        this.categories = [];
    }
    
    /**
     * Initialiser le module
     */
    async init() {
        await this.loadActivitiesData();
        this.attachEventListeners();
        console.log('⭐ Module Favoris initialisé');
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
     * Charger les favoris depuis localStorage
     */
    loadFavorites() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erreur chargement favoris:', error);
            return [];
        }
    }
    
    /**
     * Sauvegarder les favoris dans localStorage
     */
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Erreur sauvegarde favoris:', error);
        }
    }
    
    /**
     * Vérifier si une activité est en favoris
     * @param {number} activityId - ID de l'activité
     * @returns {boolean}
     */
    isFavorite(activityId) {
        return this.favorites.includes(activityId);
    }
    
    /**
     * Ajouter/Retirer une activité des favoris
     * @param {number} activityId - ID de l'activité
     */
    toggleFavorite(activityId) {
        const index = this.favorites.indexOf(activityId);
        
        if (index > -1) {
            // Retirer des favoris
            this.favorites.splice(index, 1);
        } else {
            // Ajouter aux favoris
            this.favorites.push(activityId);
        }
        
        this.saveFavorites();
        this.updateAllFavoriteButtons(activityId);
        this.renderFavoritesSection();
        
        // Animation de feedback
        this.showFavoriteNotification(activityId, index === -1);
    }
    
    /**
     * Obtenir tous les favoris
     * @returns {Array} Tableau des activités favorites
     */
    getFavorites() {
        return this.favorites
            .map(id => this.activities.find(a => a.id === id))
            .filter(a => a !== undefined);
    }
    
    /**
     * Mettre à jour tous les boutons favoris d'une activité
     * @param {number} activityId - ID de l'activité
     */
    updateAllFavoriteButtons(activityId) {
        const isFav = this.isFavorite(activityId);
        const buttons = document.querySelectorAll(`[data-favorite-id="${activityId}"]`);
        
        buttons.forEach(btn => {
            btn.classList.toggle('active', isFav);
            btn.setAttribute('aria-pressed', isFav);
            
            // Animation rapide
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    /**
     * Afficher une notification de feedback
     * @param {number} activityId - ID de l'activité
     * @param {boolean} added - true si ajouté, false si retiré
     */
    showFavoriteNotification(activityId, added) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const notification = document.createElement('div');
        notification.className = 'favorite-notification';
        notification.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <span>${added ? 'Ajouté aux favoris' : 'Retiré des favoris'}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation entrée
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Animation sortie
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    /**
     * Rendre le bouton favoris
     * @param {number} activityId - ID de l'activité
     * @returns {string} HTML du bouton
     */
    renderFavoriteButton(activityId) {
        const isFav = this.isFavorite(activityId);
        return `
            <button 
                class="favorite-btn ${isFav ? 'active' : ''}" 
                data-favorite-id="${activityId}"
                aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                aria-pressed="${isFav}"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
            </button>
        `;
    }
    
    /**
     * Attacher les événements aux boutons favoris
     */
    attachEventListeners() {
        // Délégation d'événements pour les boutons favoris
        document.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('[data-favorite-id]');
            if (favoriteBtn) {
                e.stopPropagation();
                const activityId = parseInt(favoriteBtn.dataset.favoriteId);
                this.toggleFavorite(activityId);
            }
        });
    }
    
    /**
     * Rendre la section favoris sur la page inventaire
     */
    renderFavoritesSection() {
        const favoritesContainer = document.getElementById('favoritesSection');
        if (!favoritesContainer) return;
        
        const favorites = this.getFavorites();
        
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="favorites-empty">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M32 48l-18.816 9.888 3.593-20.944L1.562 22.112l21.028-3.056L32 1l9.41 18.056 21.028 3.056-15.215 14.832 3.593 20.944z"/>
                    </svg>
                    <h3>Aucun favori</h3>
                    <p>Cliquez sur l'étoile des activités pour les ajouter à vos favoris</p>
                </div>
            `;
            return;
        }
        
        const html = favorites.map(activity => {
            const cat = this.categories.find(c => c.id === activity.category);
            const categoryColor = cat ? cat.color : '#667eea';
            
            return `
                <div class="activity-card favorite-card" data-activity-id="${activity.id}" onclick="window.animTools?.openPeek(${activity.id})">
                    <div class="activity-image" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${this.adjustColor(categoryColor, -20)} 100%);">
                        <span class="activity-category-badge">${cat ? cat.name : activity.category}</span>
                        ${this.renderFavoriteButton(activity.id)}
                    </div>
                    <div class="activity-content">
                        <h3 class="activity-title">${activity.title}</h3>
                        <div class="activity-meta">
                            <span>${activity.age}</span>
                            <span>•</span>
                            <span>${activity.duration}</span>
                            <span>•</span>
                            <span>${activity.difficulty}</span>
                        </div>
                        <p class="activity-description">${activity.description}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        favoritesContainer.innerHTML = html;
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
window.favoritesManager = null;

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', async () => {
    window.favoritesManager = new FavoritesManager();
    await window.favoritesManager.init();
});
