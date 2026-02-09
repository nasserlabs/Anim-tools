/**
 * ANIM'TOOLS - FAUSSE IA V3 - ASSISTANT AUTONOME
 * Assistant virtuel ultra-intelligent avec analyse multi-critères
 * Propose 3 niveaux de suggestions + conseils terrain professionnels
 */

class FakeAI {
    constructor() {
        this.activities = [];
        this.categories = [];
        this.isOpen = false;
        this.conversationHistory = [];
        
        // Conseils d'animateur terrain (catégorisés)
        this.animatorTips = {
            security: [
                "Vérifie toujours l'espace de jeu avant de commencer.",
                "Compte régulièrement les enfants, surtout en extérieur.",
                "Prépare une trousse de premiers secours accessible.",
                "Identifie les allergies et restrictions avant l'activité."
            ],
            pedagogy: [
                "Adapte la durée selon l'attention du groupe.",
                "Prévois toujours une variante plus simple.",
                "Valorise les efforts, pas seulement le résultat.",
                "Laisse de la place à l'improvisation des enfants."
            ],
            organization: [
                "Prépare le matériel la veille pour être serein.",
                "Garde des activités de secours pour les transitions.",
                "Anticipe les besoins en encadrement.",
                "Note ce qui fonctionne bien pour la prochaine fois."
            ],
            group: [
                "Mixe les âges pour favoriser l'entraide.",
                "Identifie les leaders positifs et négatifs.",
                "Prévois des rôles pour chacun dans les activités collectives.",
                "Adapte ton langage à l'âge du groupe."
            ]
        };
        
        this.init();
    }
    
    /**
     * Initialisation
     */
    async init() {
        await this.loadActivities();
        this.createChatInterface();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }
    
    /**
     * Charger les activités
     */
    async loadActivities() {
        try {
            const response = await fetch('data/activities.json');
            const data = await response.json();
            this.activities = data.activities;
            this.categories = data.categories;
        } catch (error) {
            console.error('Erreur chargement activités:', error);
            this.activities = [];
        }
    }
    
    /**
     * Créer l'interface du chat
     */
    createChatInterface() {
        const mascotteBtn = document.createElement('div');
        mascotteBtn.id = 'mascotte-btn';
        mascotteBtn.className = 'mascotte-floating';
        mascotteBtn.innerHTML = `
            <img src="assets/mascotte/anim-mascotte.svg" alt="Anim' le renard" />
            <div class="mascotte-pulse"></div>
        `;
        
        const chatInterface = document.createElement('div');
        chatInterface.id = 'ai-chat';
        chatInterface.className = 'ai-chat-container';
        chatInterface.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-title">
                    <img src="assets/mascotte/anim-mascotte.svg" alt="Anim'" width="32" height="32" />
                    <div>
                        <strong>Anim' l'assistant</strong>
                        <span>Expert animation périscolaire</span>
                    </div>
                </div>
                <button class="ai-chat-close" id="closeChat">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            <div class="ai-chat-messages" id="chatMessages"></div>
            <div class="ai-chat-input">
                <input type="text" id="chatInput" placeholder="Décris ta situation (âge, météo, énergie...)" />
                <button id="sendMessage">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            <div class="ai-chat-suggestions" id="chatSuggestions"></div>
        `;
        
        document.body.appendChild(mascotteBtn);
        document.body.appendChild(chatInterface);
        this.addStyles();
    }
    
    /**
     * Ajouter les styles CSS
     */
    addStyles() {
        if (document.getElementById('fake-ai-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'fake-ai-styles';
        style.textContent = `
            .mascotte-floating {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 80px;
                height: 80px;
                cursor: pointer;
                z-index: 999;
                transition: transform 0.3s ease;
            }
            .mascotte-floating:hover { transform: scale(1.1) rotate(5deg); }
            .mascotte-floating img {
                width: 100%;
                height: 100%;
                filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
            }
            .mascotte-pulse {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 20px;
                height: 20px;
                background: #FF3B30;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
            }
            .ai-chat-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 420px;
                height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
            }
            .ai-chat-container.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            .ai-chat-header {
                padding: 16px;
                border-bottom: 1px solid #e5e5e7;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #FF8C42 0%, #FFD93D 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            .ai-chat-title {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            .ai-chat-title strong {
                display: block;
                font-size: 16px;
            }
            .ai-chat-title span {
                display: block;
                font-size: 12px;
                opacity: 0.9;
            }
            .ai-chat-close {
                background: rgba(255,255,255,0.2);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: background 0.2s;
            }
            .ai-chat-close:hover { background: rgba(255,255,255,0.3); }
            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .chat-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
                animation: messageIn 0.3s ease;
            }
            @keyframes messageIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .chat-message.ai {
                align-self: flex-start;
                background: #f5f5f7;
                color: #1d1d1f;
            }
            .chat-message.user {
                align-self: flex-end;
                background: #0071e3;
                color: white;
            }
            .activity-suggestion {
                background: white;
                border: 1px solid #e5e5e7;
                border-radius: 8px;
                padding: 12px;
                margin-top: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .activity-suggestion:hover {
                border-color: #0071e3;
                box-shadow: 0 2px 8px rgba(0,113,227,0.1);
            }
            .activity-suggestion strong {
                display: block;
                margin-bottom: 4px;
                color: #1d1d1f;
            }
            .activity-suggestion small {
                color: #6e6e73;
                font-size: 12px;
            }
            .activity-suggestion .badge {
                display: inline-block;
                padding: 2px 8px;
                background: #0071e3;
                color: white;
                border-radius: 4px;
                font-size: 10px;
                margin-left: 8px;
                font-weight: 600;
            }
            .activity-suggestion .badge.alternative {
                background: #FF9500;
            }
            .activity-suggestion .badge.backup {
                background: #34C759;
            }
            .ai-tip {
                background: #fff3cd;
                border-left: 3px solid #ffc107;
                padding: 10px 12px;
                margin-top: 12px;
                border-radius: 4px;
                font-size: 13px;
                line-height: 1.4;
            }
            .ai-tip strong {
                color: #856404;
                display: block;
                margin-bottom: 4px;
            }
            .ai-chat-input {
                padding: 16px;
                border-top: 1px solid #e5e5e7;
                display: flex;
                gap: 8px;
            }
            .ai-chat-input input {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid #d2d2d7;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            .ai-chat-input input:focus { border-color: #0071e3; }
            .ai-chat-input button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: #0071e3;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .ai-chat-input button:hover { background: #0077ed; }
            .ai-chat-input button:disabled {
                background: #d2d2d7;
                cursor: not-allowed;
            }
            .ai-chat-suggestions {
                padding: 0 16px 16px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .suggestion-chip {
                padding: 6px 12px;
                background: #f5f5f7;
                border: 1px solid #e5e5e7;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .suggestion-chip:hover {
                background: #e5e5e7;
                border-color: #d2d2d7;
            }
            @media (max-width: 480px) {
                .ai-chat-container {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    bottom: 16px;
                    right: 16px;
                }
                .mascotte-floating {
                    bottom: 16px;
                    right: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Attacher les événements
     */
    attachEventListeners() {
        document.getElementById('mascotte-btn').addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChat').addEventListener('click', () => this.closeChat());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    /**
     * Ouvrir/fermer le chat
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chat = document.getElementById('ai-chat');
        const mascotte = document.getElementById('mascotte-btn');
        
        if (this.isOpen) {
            chat.classList.add('active');
            mascotte.style.display = 'none';
            document.getElementById('chatInput').focus();
        } else {
            chat.classList.remove('active');
            mascotte.style.display = 'block';
        }
    }
    
    /**
     * Fermer le chat
     */
    closeChat() {
        this.isOpen = false;
        document.getElementById('ai-chat').classList.remove('active');
        document.getElementById('mascotte-btn').style.display = 'block';
    }
    
    /**
     * Message de bienvenue
     */
    addWelcomeMessage() {
        setTimeout(() => {
            this.addAIMessage(
                "👋 Bonjour ! Je suis Anim', ton assistant expert en animation périscolaire.<br><br>" +
                "Décris-moi ta situation (âge des enfants, météo, niveau d'énergie souhaité, taille du groupe) et je te proposerai :<br>" +
                "• Une activité principale<br>" +
                "• Une alternative<br>" +
                "• Un plan B<br>" +
                "• Des conseils terrain"
            );
            this.showSuggestions();
        }, 500);
    }
    
    /**
     * Afficher les suggestions
     */
    showSuggestions() {
        const container = document.getElementById('chatSuggestions');
        const suggestions = [
            "10 enfants 6-8 ans, calme, intérieur",
            "Il pleut, groupe de 15",
            "Activité rapide avant la sortie",
            "Extérieur, beaucoup d'énergie",
            "Peu de matériel, 20 enfants"
        ];
        
        container.innerHTML = suggestions.map(s => 
            `<span class="suggestion-chip" onclick="window.fakeAI.askQuestion('${s}')">${s}</span>`
        ).join('');
    }
    
    /**
     * Envoyer un message
     */
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        
        this.addUserMessage(message);
        input.value = '';
        
        setTimeout(() => {
            this.processQuery(message);
        }, 600);
    }
    
    /**
     * Poser une question (depuis suggestion)
     */
    askQuestion(question) {
        document.getElementById('chatInput').value = question;
        this.sendMessage();
    }
    
    /**
     * Ajouter un message utilisateur
     */
    addUserMessage(text) {
        const container = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = 'chat-message user';
        msg.textContent = text;
        container.appendChild(msg);
        this.scrollToBottom();
    }
    
    /**
     * Ajouter un message IA
     */
    addAIMessage(text, suggestions = null, tip = null) {
        const container = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = 'chat-message ai';
        msg.innerHTML = text;
        
        if (suggestions) {
            // Activité principale
            if (suggestions.main) {
                const card = this.createActivityCard(suggestions.main, 'PRINCIPALE');
                msg.appendChild(card);
            }
            
            // Alternative
            if (suggestions.alternative) {
                const card = this.createActivityCard(suggestions.alternative, 'ALTERNATIVE', 'alternative');
                msg.appendChild(card);
            }
            
            // Plan B
            if (suggestions.backup) {
                const card = this.createActivityCard(suggestions.backup, 'PLAN B', 'backup');
                msg.appendChild(card);
            }
        }
        
        // Conseil terrain
        if (tip) {
            const tipDiv = document.createElement('div');
            tipDiv.className = 'ai-tip';
            tipDiv.innerHTML = `<strong>💡 Conseil terrain</strong>${tip}`;
            msg.appendChild(tipDiv);
        }
        
        container.appendChild(msg);
        this.scrollToBottom();
    }
    
    /**
     * Créer une carte d'activité
     */
    createActivityCard(activity, badgeText, badgeClass = '') {
        const card = document.createElement('div');
        card.className = 'activity-suggestion';
        card.innerHTML = `
            <strong>${activity.title} <span class="badge ${badgeClass}">${badgeText}</span></strong>
            <small>${activity.age} • ${activity.duration} • ${activity.energyLevel}</small>
        `;
        card.onclick = () => {
            window.location.href = `inventaire.html?activity=${activity.id}`;
        };
        return card;
    }
    
    /**
     * Défiler vers le bas
     */
    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * V3 - Analyser le message utilisateur (multi-critères)
     */
    analyzeUserMessage(query) {
        const lowerQuery = query.toLowerCase();
        const criteria = {};
        
        // Âge
        const ageMatch = lowerQuery.match(/(\d+)\s*(?:-|à)\s*(\d+)\s*ans/) || lowerQuery.match(/(\d+)\s*ans/);
        if (ageMatch) {
            criteria.age = ageMatch[2] ? 
                { min: parseInt(ageMatch[1]), max: parseInt(ageMatch[2]) } :
                { target: parseInt(ageMatch[1]) };
        } else if (lowerQuery.match(/petits?|maternelle/)) {
            criteria.age = { min: 3, max: 5 };
        } else if (lowerQuery.match(/moyens?/)) {
            criteria.age = { min: 6, max: 8 };
        } else if (lowerQuery.match(/grands?|ados?/)) {
            criteria.age = { min: 9, max: 12 };
        }
        
        // Énergie
        if (lowerQuery.match(/calme|tranquille|pos[eé]|relax|repos/)) {
            criteria.energyLevel = 'calme';
        } else if (lowerQuery.match(/dynamique|[eé]nergie|bouger|sport|actif/)) {
            criteria.energyLevel = 'dynamique';
        } else if (lowerQuery.match(/mod[eé]r[eé]|moyen/)) {
            criteria.energyLevel = 'modere';
        }
        
        // Météo/Environnement
        if (lowerQuery.match(/pluie|pluvieux|mauvais temps/)) {
            criteria.weather = 'rain';
            criteria.environment = 'indoor';
        } else if (lowerQuery.match(/int[eé]rieur|dedans|salle/)) {
            criteria.environment = 'indoor';
        } else if (lowerQuery.match(/ext[eé]rieur|dehors|plein air/)) {
            criteria.environment = 'outdoor';
        }
        
        // Durée
        const durationMatch = lowerQuery.match(/(\d+)\s*min/);
        if (durationMatch) {
            criteria.duration = parseInt(durationMatch[1]);
        } else if (lowerQuery.match(/rapide|court|vite/)) {
            criteria.duration = 25;
        } else if (lowerQuery.match(/long|longue/)) {
            criteria.duration = 60;
        }
        
        // Groupe
        const groupMatch = lowerQuery.match(/(\d+)\s*enfants?/);
        if (groupMatch) {
            const nb = parseInt(groupMatch[1]);
            criteria.groupType = nb <= 8 ? 'petit' : nb >= 16 ? 'grand' : 'moyen';
        } else if (lowerQuery.match(/petit groupe/)) {
            criteria.groupType = 'petit';
        } else if (lowerQuery.match(/grand groupe|nombreux|beaucoup/)) {
            criteria.groupType = 'grand';
        }
        
        // Matériel
        if (lowerQuery.match(/sans mat[eé]riel|rien/)) {
            criteria.noMaterial = true;
        } else if (lowerQuery.match(/peu de mat[eé]riel/)) {
            criteria.littleMaterial = true;
        }
        
        return criteria;
    }
    
    /**
     * V3 - Filtrer et scorer les activités (algorithme avancé)
     */
    findMatchingActivities(criteria) {
        const scored = this.activities.map(activity => {
            let score = 0;
            
            // Âge (poids 10)
            if (criteria.age) {
                const actAge = activity.age.match(/(\d+)-(\d+)/);
                if (actAge) {
                    const [, actMin, actMax] = actAge.map(Number);
                    if (criteria.age.min && criteria.age.max) {
                        if (actMin <= criteria.age.max && actMax >= criteria.age.min) score += 10;
                    } else if (criteria.age.target) {
                        if (criteria.age.target >= actMin && criteria.age.target <= actMax) score += 10;
                    }
                }
            }
            
            // Énergie (poids 9)
            if (criteria.energyLevel && activity.energyLevel === criteria.energyLevel) {
                score += 9;
            }
            
            // Environnement (poids 8)
            if (criteria.environment) {
                if (activity.environment === criteria.environment || activity.environment === 'both') {
                    score += 8;
                }
            }
            
            // Météo (poids 7)
            if (criteria.weather && activity.weather) {
                if (activity.weather.includes(criteria.weather) || activity.weather.includes('any')) {
                    score += 7;
                }
            }
            
            // Durée (poids 6)
            if (criteria.duration) {
                const actDuration = parseInt(activity.duration);
                const diff = Math.abs(actDuration - criteria.duration);
                if (diff <= 10) score += 6;
                else if (diff <= 20) score += 4;
                else if (diff <= 30) score += 2;
            }
            
            // Groupe (poids 5)
            if (criteria.groupType && activity.groupType === criteria.groupType) {
                score += 5;
            }
            
            // Matériel (poids 4)
            if (criteria.noMaterial && activity.materials.length <= 1) {
                score += 4;
            } else if (criteria.littleMaterial && activity.materials.length <= 3) {
                score += 3;
            }
            
            return { activity, score };
        });
        
        // Trier par score
        scored.sort((a, b) => b.score - a.score);
        
        // Retourner les 3 meilleures avec score > 5
        return scored.filter(s => s.score > 5).slice(0, 10);
    }
    
    /**
     * V3 - Générer 3 suggestions (principale, alternative, plan B)
     */
    generateSuggestions(matchedActivities, criteria) {
        if (matchedActivities.length === 0) return null;
        
        const suggestions = {};
        
        // Principale : meilleur score
        suggestions.main = matchedActivities[0].activity;
        
        // Alternative : différente catégorie si possible
        const mainCategory = suggestions.main.category;
        const alternative = matchedActivities.find(m => 
            m.activity.category !== mainCategory && m.score >= matchedActivities[0].score * 0.7
        );
        suggestions.alternative = alternative ? alternative.activity : matchedActivities[1]?.activity;
        
        // Plan B : totalement différent (énergie opposée ou catégorie différente)
        const mainEnergy = suggestions.main.energyLevel;
        const backup = matchedActivities.find(m => 
            m.activity.energyLevel !== mainEnergy && 
            m.activity.category !== mainCategory &&
            m.score >= matchedActivities[0].score * 0.5
        );
        suggestions.backup = backup ? backup.activity : matchedActivities[2]?.activity;
        
        return suggestions;
    }
    
    /**
     * V3 - Générer un conseil terrain contextualisé
     */
    generateContextualTip(criteria, mainActivity) {
        let tips = [];
        
        // Sécurité si extérieur
        if (criteria.environment === 'outdoor') {
            tips.push(...this.animatorTips.security);
        }
        
        // Organisation si grand groupe
        if (criteria.groupType === 'grand') {
            tips.push(...this.animatorTips.group);
        }
        
        // Pédagogie si petits
        if (criteria.age && criteria.age.max <= 6) {
            tips.push(...this.animatorTips.pedagogy);
        }
        
        // Par défaut
        if (tips.length === 0) {
            tips = [...this.animatorTips.organization];
        }
        
        return tips[Math.floor(Math.random() * tips.length)];
    }
    
    /**
     * V3 - Générer la réponse complète
     */
    generateResponse(criteria, matchedActivities) {
        if (matchedActivities.length === 0) {
            return {
                text: "Je n'ai pas trouvé d'activité correspondant exactement à ta demande. Peux-tu préciser : l'âge, le lieu (intérieur/extérieur), ou le type d'activité recherché ?",
                suggestions: null,
                tip: null
            };
        }
        
        const suggestions = this.generateSuggestions(matchedActivities, criteria);
        const tip = this.generateContextualTip(criteria, suggestions.main);
        
        // Construire l'explication
        let explanation = [];
        if (criteria.energyLevel) explanation.push(`activités ${criteria.energyLevel}s`);
        if (criteria.environment) explanation.push(`en ${criteria.environment === 'indoor' ? 'intérieur' : 'extérieur'}`);
        if (criteria.age) {
            if (criteria.age.min && criteria.age.max) {
                explanation.push(`pour ${criteria.age.min}-${criteria.age.max} ans`);
            } else if (criteria.age.target) {
                explanation.push(`pour ${criteria.age.target} ans`);
            }
        }
        if (criteria.groupType) explanation.push(`${criteria.groupType} groupe`);
        
        const text = explanation.length > 0 ?
            `Voici 3 propositions ${explanation.join(', ')} :` :
            "Voici 3 activités qui pourraient te convenir :";
        
        return { text, suggestions, tip };
    }
    
    /**
     * V3 - Traiter la question (point d'entrée principal)
     */
    processQuery(query) {
        // Analyser
        const criteria = this.analyzeUserMessage(query);
        
        // Filtrer et scorer
        const matchedActivities = this.findMatchingActivities(criteria);
        
        // Générer la réponse
        const response = this.generateResponse(criteria, matchedActivities);
        
        // Afficher
        this.addAIMessage(response.text, response.suggestions, response.tip);
    }
}

// Initialiser
let fakeAI;
document.addEventListener('DOMContentLoaded', () => {
    fakeAI = new FakeAI();
    window.fakeAI = fakeAI; // Exposer globalement pour les suggestions
});
