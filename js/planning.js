/**
 * ANIM'TOOLS - MODULE PLANNING
 * Gestion du planning hebdomadaire avec sauvegarde locale et export PDF
 */

class PlanningManager {
    constructor() {
        this.currentWeek = this.getCurrentWeek();
        this.planningData = this.loadFromStorage();
        this.timeSlots = ['8h00', '9h00', '10h00', '11h00', '12h00', '13h00', '14h00', '15h00', '16h00', '17h00', '18h00', '19h00'];
        this.weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        
        this.init();
    }
    
    /**
     * Initialisation du module
     */
    init() {
        this.renderPlanning();
        this.attachEventListeners();
        console.log('📅 Module Planning initialisé');
    }
    
    /**
     * Obtenir la semaine courante
     */
    getCurrentWeek() {
        const now = new Date();
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        return {
            start: new Date(firstDay),
            end: new Date(firstDay.getTime() + 4 * 24 * 60 * 60 * 1000)
        };
    }
    
    /**
     * Formater une date
     */
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    /**
     * Charger les données depuis localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('animtools_planning');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Erreur chargement planning:', error);
            return {};
        }
    }
    
    /**
     * Sauvegarder dans localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('animtools_planning', JSON.stringify(this.planningData));
            this.showNotification('Planning sauvegardé automatiquement', 'success');
        } catch (error) {
            console.error('Erreur sauvegarde planning:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#34c759' : type === 'error' ? '#ff3b30' : '#0071e3'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Rendre le planning
     */
    renderPlanning() {
        this.renderToolbar();
        this.renderGrid();
    }
    
    /**
     * Rendre la barre d'outils
     */
    renderToolbar() {
        const toolbar = document.getElementById('planningToolbar');
        if (!toolbar) return;
        
        toolbar.innerHTML = `
            <div class="planning-week-selector">
                <button class="week-nav-btn" id="prevWeek" aria-label="Semaine précédente">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 12L6 8L10 4"/>
                    </svg>
                </button>
                <div class="week-display">
                    ${this.formatDate(this.currentWeek.start)} - ${this.formatDate(this.currentWeek.end)}
                </div>
                <button class="week-nav-btn" id="nextWeek" aria-label="Semaine suivante">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 12L10 8L6 4"/>
                    </svg>
                </button>
            </div>
            
            <div class="planning-actions">
                <button class="btn btn-secondary" id="clearPlanning">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 4h12M5.5 4V2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5V4m2 0v10a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V4"/>
                    </svg>
                    Effacer
                </button>
                <button class="btn btn-primary" id="exportPDF">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 10v2.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5V10M8 10V2M5 5l3-3 3 3"/>
                    </svg>
                    Exporter PDF
                </button>
            </div>
        `;
    }
    
    /**
     * Rendre la grille
     */
    renderGrid() {
        const grid = document.getElementById('planningGrid');
        if (!grid) return;
        
        // Header
        let headerHTML = '<div class="planning-header">';
        headerHTML += '<div class="planning-header-cell">Horaire</div>';
        this.weekDays.forEach(day => {
            headerHTML += `<div class="planning-header-cell">${day}</div>`;
        });
        headerHTML += '</div>';
        
        // Body
        let bodyHTML = '<div class="planning-body">';
        this.timeSlots.forEach(time => {
            bodyHTML += `<div class="time-slot">${time}</div>`;
            
            this.weekDays.forEach((day, dayIndex) => {
                const weekKey = this.getWeekKey();
                const cellKey = `${weekKey}_${dayIndex}_${time}`;
                const activities = this.planningData[cellKey] || [];
                
                bodyHTML += `<div class="day-cell" data-day="${dayIndex}" data-time="${time}">`;
                
                activities.forEach((activity, actIndex) => {
                    bodyHTML += `
                        <div class="activity-block" data-activity-index="${actIndex}">
                            <div class="activity-block-title">${activity.title}</div>
                            <div class="activity-block-time">${activity.group || 'Groupe'} • ${activity.duration || '30min'}</div>
                        </div>
                    `;
                });
                
                bodyHTML += `
                    <button class="add-activity-btn" aria-label="Ajouter une activité">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 2v12M2 8h12"/>
                        </svg>
                    </button>
                </div>`;
            });
        });
        bodyHTML += '</div>';
        
        grid.innerHTML = headerHTML + bodyHTML;
    }
    
    /**
     * Obtenir la clé de la semaine
     */
    getWeekKey() {
        return `${this.currentWeek.start.getFullYear()}-W${this.getWeekNumber(this.currentWeek.start)}`;
    }
    
    /**
     * Obtenir le numéro de semaine
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    /**
     * Attacher les événements
     */
    attachEventListeners() {
        // Navigation semaine
        document.addEventListener('click', (e) => {
            if (e.target.closest('#prevWeek')) {
                this.changeWeek(-1);
            } else if (e.target.closest('#nextWeek')) {
                this.changeWeek(1);
            } else if (e.target.closest('#clearPlanning')) {
                this.clearPlanning();
            } else if (e.target.closest('#exportPDF')) {
                this.exportToPDF();
            } else if (e.target.closest('.add-activity-btn')) {
                const cell = e.target.closest('.day-cell');
                this.openActivityModal(cell);
            } else if (e.target.closest('.activity-block')) {
                const block = e.target.closest('.activity-block');
                const cell = block.closest('.day-cell');
                this.editActivity(cell, parseInt(block.dataset.activityIndex));
            }
        });
    }
    
    /**
     * Changer de semaine
     */
    changeWeek(direction) {
        const days = direction * 7;
        this.currentWeek.start.setDate(this.currentWeek.start.getDate() + days);
        this.currentWeek.end.setDate(this.currentWeek.end.getDate() + days);
        this.renderPlanning();
    }
    
    /**
     * Ouvrir la modal d'ajout d'activité
     */
    openActivityModal(cell, activityIndex = null) {
        const day = cell.dataset.day;
        const time = cell.dataset.time;
        const weekKey = this.getWeekKey();
        const cellKey = `${weekKey}_${day}_${time}`;
        
        const existingActivity = activityIndex !== null 
            ? (this.planningData[cellKey] || [])[activityIndex]
            : null;
        
        // Créer la modal
        let modal = document.getElementById('planningModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'planningModal';
            modal.className = 'planning-modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="planning-modal-content">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 600;">
                    ${existingActivity ? 'Modifier l\'activité' : 'Ajouter une activité'}
                </h3>
                
                <form id="activityForm">
                    <div class="planning-form-group">
                        <label class="planning-form-label" for="activityTitle">Titre de l'activité *</label>
                        <input 
                            type="text" 
                            id="activityTitle" 
                            class="planning-form-input" 
                            value="${existingActivity?.title || ''}"
                            required
                        >
                    </div>
                    
                    <div class="planning-form-group">
                        <label class="planning-form-label" for="activityGroup">Groupe</label>
                        <input 
                            type="text" 
                            id="activityGroup" 
                            class="planning-form-input" 
                            placeholder="Ex: Groupe A, 6-8 ans, etc."
                            value="${existingActivity?.group || ''}"
                        >
                    </div>
                    
                    <div class="planning-form-group">
                        <label class="planning-form-label" for="activityDuration">Durée</label>
                        <select id="activityDuration" class="planning-form-select">
                            <option value="15min" ${existingActivity?.duration === '15min' ? 'selected' : ''}>15 min</option>
                            <option value="30min" ${existingActivity?.duration === '30min' ? 'selected' : ''}>30 min</option>
                            <option value="45min" ${existingActivity?.duration === '45min' ? 'selected' : ''}>45 min</option>
                            <option value="1h" ${existingActivity?.duration === '1h' ? 'selected' : ''}>1h</option>
                            <option value="1h30" ${existingActivity?.duration === '1h30' ? 'selected' : ''}>1h30</option>
                            <option value="2h" ${existingActivity?.duration === '2h' ? 'selected' : ''}>2h</option>
                        </select>
                    </div>
                    
                    <div class="planning-form-group">
                        <label class="planning-form-label" for="activityNotes">Notes (optionnel)</label>
                        <textarea 
                            id="activityNotes" 
                            class="planning-form-textarea" 
                            placeholder="Matériel nécessaire, remarques, etc."
                        >${existingActivity?.notes || ''}</textarea>
                    </div>
                    
                    <div class="planning-form-actions">
                        ${existingActivity ? '<button type="button" class="btn btn-ghost" id="deleteActivity">Supprimer</button>' : ''}
                        <button type="button" class="btn btn-ghost" id="cancelActivity">Annuler</button>
                        <button type="submit" class="btn btn-primary">
                            ${existingActivity ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Événements de la modal
        const form = document.getElementById('activityForm');
        const cancelBtn = document.getElementById('cancelActivity');
        const deleteBtn = document.getElementById('deleteActivity');
        
        form.onsubmit = (e) => {
            e.preventDefault();
            const activity = {
                title: document.getElementById('activityTitle').value,
                group: document.getElementById('activityGroup').value,
                duration: document.getElementById('activityDuration').value,
                notes: document.getElementById('activityNotes').value
            };
            
            if (!this.planningData[cellKey]) {
                this.planningData[cellKey] = [];
            }
            
            if (activityIndex !== null) {
                this.planningData[cellKey][activityIndex] = activity;
            } else {
                this.planningData[cellKey].push(activity);
            }
            
            this.saveToStorage();
            this.closeModal();
            this.renderGrid();
        };
        
        cancelBtn.onclick = () => this.closeModal();
        
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                if (confirm('Supprimer cette activité ?')) {
                    this.planningData[cellKey].splice(activityIndex, 1);
                    if (this.planningData[cellKey].length === 0) {
                        delete this.planningData[cellKey];
                    }
                    this.saveToStorage();
                    this.closeModal();
                    this.renderGrid();
                }
            };
        }
        
        // Fermer au clic sur l'overlay
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        };
        
        // Focus sur le champ titre
        document.getElementById('activityTitle').focus();
    }
    
    /**
     * Modifier une activité
     */
    editActivity(cell, activityIndex) {
        this.openActivityModal(cell, activityIndex);
    }
    
    /**
     * Fermer la modal
     */
    closeModal() {
        const modal = document.getElementById('planningModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    /**
     * Effacer tout le planning
     */
    clearPlanning() {
        if (confirm('Êtes-vous sûr de vouloir effacer tout le planning de cette semaine ?')) {
            const weekKey = this.getWeekKey();
            Object.keys(this.planningData).forEach(key => {
                if (key.startsWith(weekKey)) {
                    delete this.planningData[key];
                }
            });
            this.saveToStorage();
            this.renderGrid();
            this.showNotification('Planning effacé', 'success');
        }
    }
    
    /**
     * Exporter en PDF
     */
    async exportToPDF() {
        this.showNotification('Génération du PDF en cours...', 'info');
        
        try {
            // Vérifier si html2pdf est chargé
            if (typeof html2pdf === 'undefined') {
                throw new Error('Librairie html2pdf non chargée');
            }
            
            // Créer un élément temporaire pour le PDF
            const element = document.createElement('div');
            element.style.cssText = 'padding: 20px; background: white; font-family: Arial, sans-serif;';
            
            let html = `
                <h1 style="text-align: center; margin-bottom: 10px; font-size: 24px;">Planning Anim'Tools</h1>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">
                    Semaine du ${this.formatDate(this.currentWeek.start)} au ${this.formatDate(this.currentWeek.end)}
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: #f5f5f7;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Horaire</th>
            `;
            
            this.weekDays.forEach(day => {
                html += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${day}</th>`;
            });
            html += '</tr></thead><tbody>';
            
            this.timeSlots.forEach(time => {
                html += `<tr><td style="border: 1px solid #ddd; padding: 8px; background: #f5f5f7; font-weight: bold;">${time}</td>`;
                
                this.weekDays.forEach((day, dayIndex) => {
                    const weekKey = this.getWeekKey();
                    const cellKey = `${weekKey}_${dayIndex}_${time}`;
                    const activities = this.planningData[cellKey] || [];
                    
                    html += '<td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">';
                    activities.forEach(activity => {
                        html += `
                            <div style="margin-bottom: 5px; padding: 5px; background: #e3f2fd; border-radius: 4px;">
                                <strong>${activity.title}</strong><br>
                                <small style="color: #666;">${activity.group || ''} ${activity.group && activity.duration ? '•' : ''} ${activity.duration || ''}</small>
                                ${activity.notes ? `<br><small style="color: #888;">${activity.notes}</small>` : ''}
                            </div>
                        `;
                    });
                    html += '</td>';
                });
                
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            element.innerHTML = html;
            
            // Options PDF
            const opt = {
                margin: 10,
                filename: `planning_${this.getWeekKey()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };
            
            // Générer et télécharger
            await html2pdf().set(opt).from(element).save();
            this.showNotification('PDF généré avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur export PDF:', error);
            this.showNotification('Erreur lors de l\'export PDF', 'error');
        }
    }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('planningGrid')) {
        window.planningManager = new PlanningManager();
    }
});

// Ajouter les animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
