/**
 * ANIM'TOOLS - SCRIPT PRINCIPAL
 * Gestion des interactions et animations du site
 */

class AnimTools {
    constructor() {
        this.activities = [];
        this.categories = [];
        this.currentCategory = 'all';
        
        this.init();
    }
    
    /**
     * Initialisation de l'application
     */
    async init() {
        this.setupNavigation();
        this.setupAnimations();
        await this.loadData();
        this.initializePage();
        
        console.log('🎨 Anim\'Tools chargé avec succès');
    }
    
    /**
     * Configuration de la navigation
     */
    setupNavigation() {
        // Effet scroll sur la navbar
        const navbar = document.querySelector('.navbar');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
        
        // Marquer le lien actif
        this.setActiveNavLink();
    }
    
    /**
     * Marquer le lien de navigation actif
     */
    setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Configuration des animations
     */
    setupAnimations() {
        // Intersection Observer pour les animations au scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observer les cartes et sections
        document.querySelectorAll('.card, .activity-card, .section-header').forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Charger les données depuis JSON
     */
    async loadData() {
        try {
            const response = await fetch('data/activities.json');
            const data = await response.json();
            this.activities = data.activities;
            this.categories = data.categories;
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
        }
    }
    
    /**
     * Initialiser la page actuelle
     */
    initializePage() {
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (currentPage) {
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
            default:
                this.initHomePage();
        }
    }
    
    /**
     * Initialiser la page d'accueil
     */
    initHomePage() {
        console.log('Page d\'accueil initialisée');
        
        // Animation de la mascotte au survol
        const mascotte = document.querySelector('.mascotte');
        if (mascotte) {
            mascotte.addEventListener('mouseenter', () => {
                mascotte.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            mascotte.addEventListener('mouseleave', () => {
                mascotte.style.transform = 'scale(1) rotate(0deg)';
            });
        }
    }
    
    /**
     * Initialiser la page inventaire
     */
    initInventairePage() {
        console.log('Page inventaire initialisée');
        
        // Afficher les catégories
        this.displayCategories();
        
        // Afficher toutes les activités
        this.displayActivities();
        
        // Vérifier si une activité spécifique est demandée
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activity');
        
        if (activityId) {
            this.highlightActivity(activityId);
        }
    }
    
    /**
     * Afficher les filtres de catégories
     */
    displayCategories() {
        const filtersContainer = document.getElementById('categoryFilters');
        if (!filtersContainer) return;
        
        const allButton = `
            <button class="category-btn active" data-category="all">
                Toutes
            </button>
        `;
        
        const categoryButtons = this.categories.map(cat => `
            <button class="category-btn" data-category="${cat.id}">
                ${cat.name}
            </button>
        `).join('');
        
        filtersContainer.innerHTML = allButton + categoryButtons;
        
        // Attacher les événements
        filtersContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
                
                // Mettre à jour l'état actif
                filtersContainer.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
            });
        });
    }
    
    /**
     * Afficher les activités
     */
    displayActivities(category = 'all') {
        const activitiesContainer = document.getElementById('activitiesGrid');
        if (!activitiesContainer) return;
        
        const filtered = category === 'all' 
            ? this.activities 
            : this.activities.filter(a => a.category === category);
        
        const html = filtered.map(activity => {
            const cat = this.categories.find(c => c.id === activity.category);
            const categoryColor = cat ? cat.color : '#667eea';
            
            return `
                <div class="activity-card" data-activity-id="${activity.id}">
                    <div class="activity-image" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${this.adjustColor(categoryColor, -20)} 100%);">
                        <span class="activity-category-badge">${cat ? cat.name : activity.category}</span>
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
        
        activitiesContainer.innerHTML = html;
        
        // Attacher les événements de clic
        this.attachActivityClickEvents();
    }
    
    /**
     * Filtrer par catégorie
     */
    filterByCategory(category) {
        this.currentCategory = category;
        this.displayActivities(category);
    }
    
    /**
     * Mettre en surbrillance une activité
     */
    highlightActivity(activityId) {
        setTimeout(() => {
            const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
            if (activityCard) {
                activityCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                activityCard.style.boxShadow = '0 0 0 3px var(--color-accent)';
                
                setTimeout(() => {
                    activityCard.style.boxShadow = '';
                }, 2000);
            }
        }, 500);
    }
    
    /**
     * Gérer les clics sur les activités
     */
    attachActivityClickEvents() {
        const activityCards = document.querySelectorAll('.activity-card');
        
        activityCards.forEach(card => {
            card.addEventListener('click', () => {
                const activityId = card.dataset.activityId;
                this.showActivityDetails(activityId);
            });
        });
    }
    
    /**
     * Afficher les détails d'une activité
     * TODO: Implémenter modal ou page détails
     */
    showActivityDetails(activityId) {
        const activity = this.activities.find(a => a.id == activityId);
        if (!activity) return;
        
        // Pour l'instant, juste un log
        console.log('Activité sélectionnée:', activity);
        
        // Future implémentation: modal avec détails complets
        alert(`Activité: ${activity.title}\n\nDétails complets à venir dans la prochaine version!`);
    }
    
    /**
     * Initialiser la page planning
     */
    initPlanningPage() {
        console.log('Page planning initialisée');
        // À implémenter dans la V2
    }
    
    /**
     * Initialiser la page réglementation
     */
    initReglementationPage() {
        console.log('Page réglementation initialisée');
        // À implémenter
    }
    
    /**
     * Initialiser la page administratif
     */
    initAdministratifPage() {
        console.log('Page administratif initialisée');
        // À implémenter
    }
    
    /**
     * Ajuster une couleur (plus clair ou plus foncé)
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

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.animTools = new AnimTools();
});

// Smooth scroll pour les liens ancre
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.hash) {
        const target = document.querySelector(e.target.hash);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimTools;
}
