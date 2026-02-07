/**
 * ANIM'TOOLS - FAKE AI CHATBOT
 * Mascotte interactive avec réponses basées sur activities.json
 * Aucune API - 100% frontend
 */

class FakeAI {
    constructor() {
        this.activities = [];
        this.isOpen = false;
        this.conversationHistory = [];
        
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
                "Bonjour ! 👋 Je suis Anim', votre assistant pour trouver l'activité parfaite. Posez-moi une question !"
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
            "Jour de pluie",
            "Sans matériel",
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
     * Traiter la question
     */
    processQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Détection de l'intention
        let results = [];
        let response = "";
        
        // Âge
        if (lowerQuery.match(/\d+-\d+\s*ans/) || lowerQuery.includes('ans')) {
            const ageMatch = lowerQuery.match(/(\d+)/);
            if (ageMatch) {
                const age = parseInt(ageMatch[1]);
                results = this.activities.filter(a => {
                    const ageRange = a.age.match(/(\d+)-(\d+)/);
                    if (ageRange) {
                        return age >= parseInt(ageRange[1]) && age <= parseInt(ageRange[2]);
                    }
                    return false;
                });
                response = `Voici des activités adaptées pour cet âge :`;
            }
        }
        
        // Calme / intérieur
        else if (lowerQuery.includes('calme') || lowerQuery.includes('tranquille')) {
            results = this.activities.filter(a => 
                a.category === 'manuelles' || a.category === 'societe' || a.category === 'expression'
            );
            response = "Voici des activités calmes parfaites pour un moment de détente :";
        }
        
        // Pluie / intérieur
        else if (lowerQuery.includes('pluie') || lowerQuery.includes('intérieur') || lowerQuery.includes('dedans')) {
            results = this.activities.filter(a => 
                a.category !== 'sorties' && a.category !== 'sportifs'
            );
            response = "Pas de souci ! Voici des activités d'intérieur pour un jour de pluie :";
        }
        
        // Sans matériel
        else if (lowerQuery.includes('sans matériel') || lowerQuery.includes('sans rien')) {
            results = this.activities.filter(a => 
                a.materials.length <= 2
            );
            response = "Voici des activités avec peu ou pas de matériel :";
        }
        
        // Rapide / court
        else if (lowerQuery.includes('rapide') || lowerQuery.includes('court') || lowerQuery.includes('vite')) {
            results = this.activities.filter(a => {
                const duration = parseInt(a.duration);
                return duration <= 30;
            });
            response = "Voici des activités rapides (30 min ou moins) :";
        }
        
        // Sportif / bouger
        else if (lowerQuery.includes('sport') || lowerQuery.includes('bouger') || lowerQuery.includes('physique')) {
            results = this.activities.filter(a => 
                a.category === 'sportifs' || a.category === 'initiation'
            );
            response = "Voici des activités sportives pour se dépenser :";
        }
        
        // Créatif / manuel
        else if (lowerQuery.includes('créa') || lowerQuery.includes('manuel') || lowerQuery.includes('bricolage')) {
            results = this.activities.filter(a => a.category === 'manuelles');
            response = "Voici des activités manuelles et créatives :";
        }
        
        // Expression / théâtre
        else if (lowerQuery.includes('expression') || lowerQuery.includes('théâtre') || lowerQuery.includes('danse')) {
            results = this.activities.filter(a => a.category === 'expression');
            response = "Voici des activités d'expression artistique :";
        }
        
        // Par défaut
        else {
            results = this.getRandomActivities(3);
            response = "Je n'ai pas bien compris votre demande, mais voici quelques activités qui pourraient vous intéresser :";
        }
        
        // Limiter à 3 résultats
        results = results.slice(0, 3);
        
        if (results.length === 0) {
            this.addAIMessage("Désolé, je n'ai pas trouvé d'activité correspondante. Essayez de reformuler votre question ! 😊");
        } else {
            this.addAIMessage(response, results);
        }
    }
    
    /**
     * Obtenir des activités aléatoires
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
