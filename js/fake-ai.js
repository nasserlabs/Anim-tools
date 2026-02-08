/**
 * ANIM'TOOLS - FAUSSE IA INTELLIGENTE V2.1
 * Assistant virtuel enrichi avec compréhension contextuelle avancée
 * Exploite les nouveaux champs: environment, energyLevel, weather, groupType, tags
 */

class FakeAI {
    constructor() {
        this.activities = [];
        this.categories = [];
        this.isOpen = false;
        this.conversationHistory = [];
        
        // Conseils d'animateur prédéfinis
        this.animatorTips = [
            "Pense à prévoir une variante plus simple si l'activité semble trop difficile.",
            "N'oublie pas de préparer le matériel la veille pour être serein le jour J.",
            "Adapte toujours la durée selon l'attention du groupe.",
            "Garde quelques activités de secours pour les transitions.",
            "Anticipe les besoins en encadrement selon le nombre d'enfants."
        ];
        
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
     * Charger les activités depuis JSON
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
        // Bouton mascotte flottant
        const mascotteBtn = document.createElement('div');
        mascotteBtn.id = 'mascotte-btn';
        mascotteBtn.className = 'mascotte-floating';
        mascotteBtn.innerHTML = `
            <img src="assets/mascotte/anim-mascotte.svg" alt="Anim' le renard" />
            <div class="mascotte-pulse"></div>
        `;
        
        // Interface de chat
        const chatInterface = document.createElement('div');
        chatInterface.id = 'ai-chat';
        chatInterface.className = 'ai-chat-container';
        chatInterface.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-title">
                    <img src="assets/mascotte/anim-mascotte.svg" alt="Anim'" width="32" height="32" />
                    <div>
                        <strong>Anim' le renard</strong>
                        <span>Assistant virtuel</span>
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
                <input type="text" id="chatInput" placeholder="Posez-moi une question sur les activités..." />
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
        const style = document.createElement('style');
        style.textContent = `
            /* Mascotte flottante */
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
            
            .mascotte-floating:hover {
                transform: scale(1.1) rotate(5deg);
            }
            
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
            
            /* Chat container */
            .ai-chat-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 380px;
                height: 550px;
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
            
            .ai-chat-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .chat-message {
                max-width: 80%;
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
            
            .ai-chat-input input:focus {
                border-color: #0071e3;
            }
            
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
            
            .ai-chat-input button:hover {
                background: #0077ed;
            }
            
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
        const mascotteBtn = document.getElementById('mascotte-btn');
        const closeBtn = document.getElementById('closeChat');
        const sendBtn = document.getElementById('sendMessage');
        const input = document.getElementById('chatInput');
        
        mascotteBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    /**
     * Ouvrir/fermer le chat
     */
    toggleChat() {
        const chat = document.getElementById('ai-chat');
        const mascotte = document.getElementById('mascotte-btn');
        
        this.isOpen = !this.isOpen;
        
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
        const chat = document.getElementById('ai-chat');
        const mascotte = document.getElementById('mascotte-btn');
        
        this.isOpen = false;
        chat.classList.remove('active');
        mascotte.style.display = 'block';
    }
    
    /**
     * Message de bienvenue
     */
    addWelcomeMessage() {
        setTimeout(() => {
            this.addAIMessage(
                "Bonjour ! 👋 Je suis Anim', ton assistant pour trouver l'activité parfaite. Décris-moi ta situation et je te proposerai des activités adaptées."
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
            "Activité calme 6-8 ans",
            "Il pleut dehors",
            "Peu de matériel",
            "Grand groupe",
            "Activité rapide"
        ];
        
        container.innerHTML = suggestions.map(s => 
            `<span class="suggestion-chip" onclick="fakeAI.askQuestion('${s}')">${s}</span>`
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
        
        // Simuler un délai de réponse
        setTimeout(() => {
            this.processQuery(message);
        }, 600);
    }
    
    /**
     * Poser une question (depuis suggestion)
     */
    askQuestion(question) {
        const input = document.getElementById('chatInput');
        input.value = question;
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
    addAIMessage(text, activities = []) {
        const container = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = 'chat-message ai';
        msg.innerHTML = text;
        
        if (activities.length > 0) {
            activities.forEach(activity => {
                const suggestion = document.createElement('div');
                suggestion.className = 'activity-suggestion';
                suggestion.innerHTML = `
                    <strong>${activity.title}</strong>
                    <small>${activity.age} • ${activity.duration} • ${activity.category}</small>
                `;
                suggestion.onclick = () => {
                    window.location.href = `inventaire.html?activity=${activity.id}`;
                };
                msg.appendChild(suggestion);
            });
        }
        
        container.appendChild(msg);
        this.scrollToBottom();
    }
    
    /**
     * Défiler vers le bas
     */
    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * NOUVELLE FONCTION - Analyser le message utilisateur
     * Extrait les critères de recherche du langage naturel
     */
    analyzeUserMessage(query) {
        const lowerQuery = query.toLowerCase();
        const criteria = {};
        
        // Analyse de l'âge
        const agePatterns = [
            { pattern: /(\d+)\s*(?:-|à|a)\s*(\d+)\s*ans/, extract: (m) => ({ min: parseInt(m[1]), max: parseInt(m[2]) }) },
            { pattern: /(\d+)\s*ans/, extract: (m) => ({ target: parseInt(m[1]) }) },
            { pattern: /petits?|maternelle|3-5/, extract: () => ({ min: 3, max: 5 }) },
            { pattern: /moyens?|6-8/, extract: () => ({ min: 6, max: 8 }) },
            { pattern: /grands?|ados?|9-12/, extract: () => ({ min: 9, max: 12 }) }
        ];
        
        for (const { pattern, extract } of agePatterns) {
            const match = lowerQuery.match(pattern);
            if (match) {
                criteria.age = extract(match);
                break;
            }
        }
        
        // Analyse du niveau d'énergie
        if (lowerQuery.match(/calme|tranquille|pos[eé]|relax|repos|silence/)) {
            criteria.energyLevel = 'calme';
        } else if (lowerQuery.match(/dynamique|[eé]nergie|bouger|sport|actif|courir/)) {
            criteria.energyLevel = 'dynamique';
        } else if (lowerQuery.match(/mod[eé]r[eé]|moyen|normal/)) {
            criteria.energyLevel = 'modere';
        }
        
        // Analyse de la météo
        if (lowerQuery.match(/pluie|pluvieux|mouill[eé]|mauvais temps/)) {
            criteria.weather = 'rain';
        } else if (lowerQuery.match(/soleil|beau temps|dehors possible/)) {
            criteria.weather = 'sun';
        }
        
        // Analyse de l'environnement
        if (lowerQuery.match(/int[eé]rieur|dedans|salle|classe/)) {
            criteria.environment = 'indoor';
        } else if (lowerQuery.match(/ext[eé]rieur|dehors|plein air|jardin|cour/)) {
            criteria.environment = 'outdoor';
        }
        
        // Analyse de la durée
        const durationMatch = lowerQuery.match(/(\d+)\s*(?:min|minutes?)/);
        if (durationMatch) {
            criteria.duration = parseInt(durationMatch[1]);
        } else if (lowerQuery.match(/rapide|court|vite/)) {
            criteria.duration = 30;
        } else if (lowerQuery.match(/long|longue|[eé]tendu/)) {
            criteria.duration = 60;
        }
        
        // Analyse de la taille du groupe
        if (lowerQuery.match(/petit groupe|peu d'enfants|4-8/)) {
            criteria.groupType = 'petit';
        } else if (lowerQuery.match(/grand groupe|beaucoup|nombreux|20/)) {
            criteria.groupType = 'grand';
        } else if (lowerQuery.match(/moyen groupe|10-15/)) {
            criteria.groupType = 'moyen';
        }
        
        // Analyse du matériel
        if (lowerQuery.match(/sans mat[eé]riel|pas de mat[eé]riel|rien|sans rien/)) {
            criteria.noMaterial = true;
        } else if (lowerQuery.match(/peu de mat[eé]riel|simple/)) {
            criteria.littleMaterial = true;
        }
        
        // Analyse de catégorie spécifique
        if (lowerQuery.match(/manuel|cr[eé]atif|bricolage|art/)) {
            criteria.category = 'manuelles';
        } else if (lowerQuery.match(/sport|physique|bouger/)) {
            criteria.category = 'sportifs';
        } else if (lowerQuery.match(/expression|th[eé][aâ]tre|danse|musique/)) {
            criteria.category = 'expression';
        } else if (lowerQuery.match(/jeux? de soci[eé]t[eé]|plateau/)) {
            criteria.category = 'societe';
        } else if (lowerQuery.match(/sortie|visite|dehors/)) {
            criteria.category = 'sorties';
        } else if (lowerQuery.match(/initiation|d[eé]couverte|nouveau sport/)) {
            criteria.category = 'initiation';
        }
        
        return criteria;
    }
    
    /**
     * NOUVELLE FONCTION - Filtrer intelligemment les activités
     * Utilise les nouveaux champs enrichis
     */
    findMatchingActivities(criteria) {
        let filtered = [...this.activities];
        let score = new Map();
        
        filtered.forEach(activity => {
            let points = 0;
            
            // Score basé sur l'âge
            if (criteria.age) {
                const activityAge = activity.age.match(/(\d+)-(\d+)/);
                if (activityAge) {
                    const actMin = parseInt(activityAge[1]);
                    const actMax = parseInt(activityAge[2]);
                    
                    if (criteria.age.min && criteria.age.max) {
                        // Chevauchement des plages
                        if (actMin <= criteria.age.max && actMax >= criteria.age.min) {
                            points += 10;
                        }
                    } else if (criteria.age.target) {
                        // Âge cible dans la plage
                        if (criteria.age.target >= actMin && criteria.age.target <= actMax) {
                            points += 10;
                        }
                    }
                }
            }
            
            // Score basé sur le niveau d'énergie
            if (criteria.energyLevel && activity.energyLevel === criteria.energyLevel) {
                points += 8;
            }
            
            // Score basé sur l'environnement
            if (criteria.environment) {
                if (activity.environment === criteria.environment || activity.environment === 'both') {
                    points += 7;
                }
            }
            
            // Score basé sur la météo
            if (criteria.weather) {
                if (activity.weather.includes(criteria.weather) || activity.weather.includes('any')) {
                    points += 6;
                }
            }
            
            // Score basé sur la durée
            if (criteria.duration) {
                const activityDuration = parseInt(activity.duration);
                const diff = Math.abs(activityDuration - criteria.duration);
                if (diff <= 15) {
                    points += 5;
                } else if (diff <= 30) {
                    points += 3;
                }
            }
            
            // Score basé sur la taille du groupe
            if (criteria.groupType && activity.groupType === criteria.groupType) {
                points += 5;
            }
            
            // Score basé sur le matériel
            if (criteria.noMaterial && activity.materials.length <= 1) {
                points += 7;
            } else if (criteria.littleMaterial && activity.materials.length <= 3) {
                points += 5;
            }
            
            // Score basé sur la catégorie
            if (criteria.category && activity.category === criteria.category) {
                points += 6;
            }
            
            score.set(activity.id, points);
        });
        
        // Trier par score décroissant
        filtered.sort((a, b) => score.get(b.id) - score.get(a.id));
        
        // Ne garder que les activités avec un score > 0
        filtered = filtered.filter(a => score.get(a.id) > 0);
        
        return filtered.slice(0, 3);
    }
    
    /**
     * NOUVELLE FONCTION - Générer une réponse contextualisée
     * Explique pourquoi ces activités sont proposées
     */
    generateMascotResponse(activities, criteria) {
        if (activities.length === 0) {
            return "Je n'ai pas trouvé d'activité qui correspond exactement à ta demande. Peux-tu me donner plus de détails ou reformuler ?";
        }
        
        let response = "";
        const explanations = [];
        
        // Construire une explication contextuelle
        if (criteria.energyLevel === 'calme') {
            explanations.push("des activités calmes");
        } else if (criteria.energyLevel === 'dynamique') {
            explanations.push("des activités dynamiques");
        }
        
        if (criteria.environment === 'indoor') {
            explanations.push("en intérieur");
        } else if (criteria.environment === 'outdoor') {
            explanations.push("en extérieur");
        }
        
        if (criteria.weather === 'rain') {
            explanations.push("parfaites pour un jour de pluie");
        }
        
        if (criteria.age) {
            if (criteria.age.min && criteria.age.max) {
                explanations.push(`pour ${criteria.age.min}-${criteria.age.max} ans`);
            } else if (criteria.age.target) {
                explanations.push(`pour ${criteria.age.target} ans`);
            }
        }
        
        if (criteria.groupType === 'petit') {
            explanations.push("pour un petit groupe");
        } else if (criteria.groupType === 'grand') {
            explanations.push("pour un grand groupe");
        }
        
        if (criteria.noMaterial || criteria.littleMaterial) {
            explanations.push("avec peu de matériel");
        }
        
        // Assembler la réponse
        if (explanations.length > 0) {
            response = `Je te propose ${explanations.join(', ')} :`;
        } else {
            response = "Voici quelques activités qui pourraient t'intéresser :";
        }
        
        // Ajouter un conseil d'animateur aléatoire (1 fois sur 3)
        if (Math.random() > 0.66) {
            const tip = this.animatorTips[Math.floor(Math.random() * this.animatorTips.length)];
            response += `<br><br>💡 <em>${tip}</em>`;
        }
        
        return response;
    }
    
    /**
     * FONCTION ENRICHIE - Traiter la question avec la nouvelle IA
     */
    processQuery(query) {
        // Analyser le message
        const criteria = this.analyzeUserMessage(query);
        
        // Trouver les activités correspondantes
        const matches = this.findMatchingActivities(criteria);
        
        // Générer la réponse
        const response = this.generateMascotResponse(matches, criteria);
        
        // Afficher
        this.addAIMessage(response, matches);
    }
    
    /**
     * Obtenir des activités aléatoires (fallback)
     */
    getRandomActivities(count) {
        const shuffled = [...this.activities].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}

// Initialiser au chargement
let fakeAI;
document.addEventListener('DOMContentLoaded', () => {
    fakeAI = new FakeAI();
});
