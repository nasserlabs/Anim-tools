/**
 * ANIM'TOOLS - MODULE MÉTÉO
 * Affiche la météo du jour sur la page d'accueil
 * API: Open-Meteo (gratuite, sans clé API)
 */

class WeatherModule {
    constructor() {
        this.apiUrl = 'https://api.open-meteo.com/v1/forecast';
        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        this.defaultLocation = { lat: 48.8566, lon: 2.3522, name: 'Paris' }; // Fallback
        this.weatherData = null;
        
        this.init();
    }
    
    /**
     * Initialisation du module
     */
    async init() {
        const container = document.getElementById('weatherWidget');
        if (!container) return;
        
        // Afficher le loader
        this.showLoader(container);
        
        // Obtenir la localisation
        const location = await this.getLocation();
        
        // Récupérer la météo
        await this.fetchWeather(location);
        
        // Afficher
        this.renderWeather(container);
    }
    
    /**
     * Obtenir la localisation de l'utilisateur
     */
    async getLocation() {
        // Essayer la géolocalisation navigateur
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        maximumAge: 300000 // 5 minutes de cache
                    });
                });
                
                return {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    name: 'Votre position'
                };
            } catch (error) {
                console.log('Géolocalisation refusée, utilisation de Paris par défaut');
            }
        }
        
        // Fallback sur la localisation par défaut
        return this.defaultLocation;
    }
    
    /**
     * Récupérer les données météo
     */
    async fetchWeather(location) {
        try {
            const url = `${this.apiUrl}?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe/Paris`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur API météo');
            
            const data = await response.json();
            
            this.weatherData = {
                temperature: Math.round(data.current.temperature_2m),
                humidity: data.current.relative_humidity_2m,
                weatherCode: data.current.weather_code,
                windSpeed: Math.round(data.current.wind_speed_10m),
                location: location.name,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('Erreur récupération météo:', error);
            this.weatherData = null;
        }
    }
    
    /**
     * Obtenir l'icône et le libellé météo selon le code WMO
     */
    getWeatherInfo(code) {
        const weatherCodes = {
            0: { icon: '☀️', label: 'Ciel dégagé', suggestion: 'Parfait pour des activités extérieures !' },
            1: { icon: '🌤️', label: 'Principalement dégagé', suggestion: 'Idéal pour sortir' },
            2: { icon: '⛅', label: 'Partiellement nuageux', suggestion: 'Bonne journée pour toutes activités' },
            3: { icon: '☁️', label: 'Couvert', suggestion: 'Prévoir des activités en intérieur' },
            45: { icon: '🌫️', label: 'Brouillard', suggestion: 'Activités calmes recommandées' },
            48: { icon: '🌫️', label: 'Brouillard givrant', suggestion: 'Rester au chaud' },
            51: { icon: '🌦️', label: 'Bruine légère', suggestion: 'Activités sous abri' },
            53: { icon: '🌦️', label: 'Bruine modérée', suggestion: 'Activités en intérieur' },
            55: { icon: '🌧️', label: 'Bruine dense', suggestion: 'Journée intérieure' },
            61: { icon: '🌧️', label: 'Pluie légère', suggestion: 'Jeux en salle' },
            63: { icon: '🌧️', label: 'Pluie modérée', suggestion: 'Activités manuelles' },
            65: { icon: '🌧️', label: 'Pluie forte', suggestion: 'Créativité en intérieur' },
            71: { icon: '🌨️', label: 'Neige légère', suggestion: 'Bataille de boules de neige !' },
            73: { icon: '🌨️', label: 'Neige modérée', suggestion: 'Bonhomme de neige ?' },
            75: { icon: '🌨️', label: 'Neige forte', suggestion: 'Restez au chaud' },
            77: { icon: '🌨️', label: 'Grésil', suggestion: 'Intérieur obligatoire' },
            80: { icon: '🌦️', label: 'Averses légères', suggestion: 'Surveillez le ciel' },
            81: { icon: '🌦️', label: 'Averses modérées', suggestion: 'Activités rapides dehors' },
            82: { icon: '⛈️', label: 'Averses violentes', suggestion: 'Intérieur impératif' },
            85: { icon: '🌨️', label: 'Averses de neige légères', suggestion: 'Sortie courte possible' },
            86: { icon: '🌨️', label: 'Averses de neige fortes', suggestion: 'Intérieur recommandé' },
            95: { icon: '⛈️', label: 'Orage', suggestion: 'Sécurité : restez à l\'intérieur' },
            96: { icon: '⛈️', label: 'Orage avec grêle légère', suggestion: 'Danger : intérieur' },
            99: { icon: '⛈️', label: 'Orage avec grêle forte', suggestion: 'Danger : intérieur' }
        };
        
        return weatherCodes[code] || { icon: '🌈', label: 'Météo variable', suggestion: 'Préparez des activités variées' };
    }
    
    /**
     * Afficher le loader
     */
    showLoader(container) {
        container.innerHTML = `
            <div class="weather-widget loading">
                <div class="weather-loader">Chargement météo...</div>
            </div>
        `;
    }
    
    /**
     * Afficher la météo
     */
    renderWeather(container) {
        if (!this.weatherData) {
            // Fallback si erreur
            container.innerHTML = `
                <div class="weather-widget error">
                    <div class="weather-icon">🌤️</div>
                    <div class="weather-info">
                        <div class="weather-temp">--°C</div>
                        <div class="weather-label">Météo indisponible</div>
                    </div>
                </div>
            `;
            return;
        }
        
        const weatherInfo = this.getWeatherInfo(this.weatherData.weatherCode);
        
        container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-header">
                    <span class="weather-location">📍 ${this.weatherData.location}</span>
                </div>
                <div class="weather-main">
                    <div class="weather-icon-large">${weatherInfo.icon}</div>
                    <div class="weather-details">
                        <div class="weather-temp-large">${this.weatherData.temperature}°C</div>
                        <div class="weather-label">${weatherInfo.label}</div>
                    </div>
                </div>
                <div class="weather-extra">
                    <div class="weather-extra-item">
                        <span>💧 ${this.weatherData.humidity}%</span>
                    </div>
                    <div class="weather-extra-item">
                        <span>💨 ${this.weatherData.windSpeed} km/h</span>
                    </div>
                </div>
                <div class="weather-suggestion">
                    💡 ${weatherInfo.suggestion}
                </div>
            </div>
        `;
        
        this.addStyles();
    }
    
    /**
     * Ajouter les styles CSS
     */
    addStyles() {
        // Vérifier si les styles sont déjà ajoutés
        if (document.getElementById('weather-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'weather-styles';
        style.textContent = `
            .weather-widget {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                padding: 24px;
                color: white;
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                max-width: 400px;
                margin: 0 auto;
            }
            
            .weather-widget.loading,
            .weather-widget.error {
                background: #f5f5f7;
                color: #1d1d1f;
                text-align: center;
                padding: 40px 24px;
            }
            
            .weather-loader {
                font-size: 14px;
                opacity: 0.7;
            }
            
            .weather-header {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 16px;
            }
            
            .weather-location {
                display: inline-block;
            }
            
            .weather-main {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .weather-icon-large {
                font-size: 72px;
                line-height: 1;
            }
            
            .weather-details {
                flex: 1;
            }
            
            .weather-temp-large {
                font-size: 48px;
                font-weight: 700;
                line-height: 1;
                margin-bottom: 8px;
            }
            
            .weather-label {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .weather-extra {
                display: flex;
                gap: 16px;
                padding: 16px 0;
                border-top: 1px solid rgba(255,255,255,0.2);
                border-bottom: 1px solid rgba(255,255,255,0.2);
                margin-bottom: 16px;
            }
            
            .weather-extra-item {
                flex: 1;
                font-size: 14px;
            }
            
            .weather-suggestion {
                background: rgba(255,255,255,0.15);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            @media (max-width: 768px) {
                .weather-widget {
                    max-width: 100%;
                }
                
                .weather-icon-large {
                    font-size: 56px;
                }
                
                .weather-temp-large {
                    font-size: 36px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialiser uniquement sur la page d'accueil
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('weatherWidget')) {
        new WeatherModule();
    }
});
