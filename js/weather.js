/**
 * Anim'Tools – Module Météo
 * Utilise l'API Open-Meteo (gratuite, sans clé API)
 * + Nominatim (OpenStreetMap) pour la géolocalisation par ville
 * ─────────────────────────────────────────────────────────────────
 * Encapsulé dans un module IIFE – zéro conflit avec l'existant
 */

const WeatherModule = (function () {

  /* ────────────────────────────────────────────────────────────────
   * CONFIGURATION
   * ──────────────────────────────────────────────────────────────── */
  const CONFIG = {
    defaultCity: 'Paris',
    defaultLat: 48.8566,
    defaultLon: 2.3522,
    apiBase: 'https://api.open-meteo.com/v1/forecast',
    geocodeBase: 'https://nominatim.openstreetmap.org/search',
    containerId: 'weather-widget',
    cacheKey: 'animtools_weather_cache',
    cacheDuration: 30 * 60 * 1000, // 30 minutes
  };

  /* ────────────────────────────────────────────────────────────────
   * CODES WMO → DONNÉES MÉTÉO
   * Source : https://open-meteo.com/en/docs#weathervariables
   * ──────────────────────────────────────────────────────────────── */
  const WMO_CODES = {
    0:  { label: 'Ciel dégagé',       icon: '☀️',  color: '#F59E0B', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', class: 'sunny' },
    1:  { label: 'Peu nuageux',        icon: '🌤️', color: '#F59E0B', bg: 'linear-gradient(135deg, #FEF3C7, #E0F2FE)', class: 'sunny' },
    2:  { label: 'Partiellement nuageux', icon: '⛅', color: '#64748B', bg: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', class: 'cloudy' },
    3:  { label: 'Couvert',            icon: '☁️',  color: '#475569', bg: 'linear-gradient(135deg, #E2E8F0, #CBD5E1)', class: 'cloudy' },
    45: { label: 'Brouillard',         icon: '🌫️', color: '#94A3B8', bg: 'linear-gradient(135deg, #E2E8F0, #F8FAFC)', class: 'foggy' },
    48: { label: 'Brouillard givrant', icon: '🌫️', color: '#94A3B8', bg: 'linear-gradient(135deg, #E2E8F0, #F8FAFC)', class: 'foggy' },
    51: { label: 'Bruine légère',      icon: '🌦️', color: '#0EA5E9', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', class: 'rainy' },
    53: { label: 'Bruine modérée',     icon: '🌦️', color: '#0EA5E9', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', class: 'rainy' },
    55: { label: 'Bruine dense',       icon: '🌧️', color: '#0284C7', bg: 'linear-gradient(135deg, #BAE6FD, #7DD3FC)', class: 'rainy' },
    61: { label: 'Pluie légère',       icon: '🌧️', color: '#0284C7', bg: 'linear-gradient(135deg, #DBEAFE, #BAE6FD)', class: 'rainy' },
    63: { label: 'Pluie modérée',      icon: '🌧️', color: '#0369A1', bg: 'linear-gradient(135deg, #BAE6FD, #7DD3FC)', class: 'rainy' },
    65: { label: 'Pluie forte',        icon: '⛈️',  color: '#0369A1', bg: 'linear-gradient(135deg, #7DD3FC, #38BDF8)', class: 'stormy' },
    71: { label: 'Neige légère',       icon: '🌨️', color: '#7DD3FC', bg: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', class: 'snowy' },
    73: { label: 'Neige modérée',      icon: '❄️',  color: '#38BDF8', bg: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', class: 'snowy' },
    75: { label: 'Neige forte',        icon: '❄️',  color: '#0EA5E9', bg: 'linear-gradient(135deg, #BAE6FD, #7DD3FC)', class: 'snowy' },
    80: { label: 'Averses légères',    icon: '🌦️', color: '#0EA5E9', bg: 'linear-gradient(135deg, #DBEAFE, #BAE6FD)', class: 'rainy' },
    81: { label: 'Averses modérées',   icon: '🌧️', color: '#0284C7', bg: 'linear-gradient(135deg, #BAE6FD, #7DD3FC)', class: 'rainy' },
    82: { label: 'Averses violentes',  icon: '⛈️',  color: '#0369A1', bg: 'linear-gradient(135deg, #7DD3FC, #38BDF8)', class: 'stormy' },
    85: { label: 'Averses de neige',   icon: '🌨️', color: '#7DD3FC', bg: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', class: 'snowy' },
    95: { label: 'Orage',              icon: '⛈️',  color: '#1E3A5F', bg: 'linear-gradient(135deg, #1E3A5F, #2E5984)', class: 'stormy' },
    96: { label: 'Orage avec grêle',   icon: '⛈️',  color: '#1E3A5F', bg: 'linear-gradient(135deg, #0C1F33, #1E3A5F)', class: 'stormy' },
    99: { label: 'Orage violent',      icon: '⛈️',  color: '#0C1F33', bg: 'linear-gradient(135deg, #0C1F33, #1A1A2E)', class: 'stormy' },
  };

  /* ────────────────────────────────────────────────────────────────
   * CONSEIL ACTIVITÉ selon météo
   * ──────────────────────────────────────────────────────────────── */
  const WEATHER_ADVICE = {
    sunny:  { icon: '🏃', text: 'Parfait pour les activités en extérieur !' },
    cloudy: { icon: '🎨', text: 'Idéal pour mixer intérieur et extérieur.' },
    rainy:  { icon: '🎭', text: 'Privilégiez les activités en intérieur.' },
    stormy: { icon: '📚', text: 'Journée intérieure recommandée.' },
    snowy:  { icon: '⛄', text: 'Activités neige ou intérieur cosy !' },
    foggy:  { icon: '🧩', text: 'Bonne journée pour les jeux de société.' },
  };

  /* ────────────────────────────────────────────────────────────────
   * CACHE LOCAL
   * ──────────────────────────────────────────────────────────────── */
  function getCache() {
    try {
      const raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > CONFIG.cacheDuration) return null;
      return data;
    } catch { return null; }
  }

  function setCache(data) {
    try {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch { /* silently fail */ }
  }

  /* ────────────────────────────────────────────────────────────────
   * GÉOLOCALISATION
   * ──────────────────────────────────────────────────────────────── */
  function getUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: CONFIG.defaultLat, lon: CONFIG.defaultLon, city: CONFIG.defaultCity });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          const city = await reverseGeocode(lat, lon);
          resolve({ lat, lon, city });
        },
        () => {
          resolve({ lat: CONFIG.defaultLat, lon: CONFIG.defaultLon, city: CONFIG.defaultCity });
        },
        { timeout: 5000 }
      );
    });
  }

  async function reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || CONFIG.defaultCity;
    } catch {
      return CONFIG.defaultCity;
    }
  }

  /* ────────────────────────────────────────────────────────────────
   * FETCH MÉTÉO (Open-Meteo)
   * ──────────────────────────────────────────────────────────────── */
  async function fetchWeather(lat, lon) {
    const url = `${CONFIG.apiBase}?latitude=${lat}&longitude=${lon}`
      + `&current_weather=true`
      + `&hourly=relative_humidity_2m`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max`
      + `&timezone=auto`
      + `&forecast_days=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Météo indisponible');
    return res.json();
  }

  /* ────────────────────────────────────────────────────────────────
   * RENDU HTML
   * ──────────────────────────────────────────────────────────────── */
  function getWeatherInfo(code) {
    return WMO_CODES[code] || WMO_CODES[0];
  }

  function render(container, weatherData) {
    const { current_weather, daily } = weatherData.apiData;
    const { city } = weatherData;

    const code    = current_weather.weathercode;
    const temp    = Math.round(current_weather.temperature);
    const windspeed = Math.round(current_weather.windspeed);
    const info    = getWeatherInfo(code);
    const advice  = WEATHER_ADVICE[info.class] || WEATHER_ADVICE.sunny;
    const tempMax = Math.round(daily.temperature_2m_max[0]);
    const tempMin = Math.round(daily.temperature_2m_min[0]);
    const rain    = daily.precipitation_probability_max[0];

    // Couleur dynamique sur le widget
    container.style.background = info.bg;
    container.classList.remove('sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy');
    container.classList.add(info.class);

    container.innerHTML = `
      <div class="weather-main">
        <div class="weather-icon-temp">
          <span class="weather-icon">${info.icon}</span>
          <div class="weather-temp-block">
            <span class="weather-temp">${temp}°C</span>
            <span class="weather-city">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              ${city}
            </span>
          </div>
        </div>
        <div class="weather-condition">
          <span class="weather-label">${info.label}</span>
          <div class="weather-details">
            <span title="Température max / min">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
              ${tempMax}° / ${tempMin}°
            </span>
            <span title="Probabilité de pluie">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
              ${rain}%
            </span>
            <span title="Vent">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
              </svg>
              ${windspeed} km/h
            </span>
          </div>
        </div>
      </div>
      <div class="weather-advice">
        <span class="weather-advice-icon">${advice.icon}</span>
        <span class="weather-advice-text">${advice.text}</span>
      </div>
    `;
  }

  function renderSkeleton(container) {
    container.innerHTML = `
      <div class="weather-skeleton">
        <div class="skeleton-icon"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
        </div>
      </div>
    `;
  }

  function renderError(container) {
    container.innerHTML = `
      <div class="weather-error">
        <span>🌡️</span>
        <span>Météo indisponible</span>
      </div>
    `;
  }

  /* ────────────────────────────────────────────────────────────────
   * INIT PRINCIPAL
   * ──────────────────────────────────────────────────────────────── */
  async function init() {
    const container = document.getElementById(CONFIG.containerId);
    if (!container) return;

    // Affiche le skeleton pendant le chargement
    renderSkeleton(container);

    // Vérifie le cache d'abord
    const cached = getCache();
    if (cached) {
      render(container, cached);
      return;
    }

    try {
      const { lat, lon, city } = await getUserLocation();
      const apiData = await fetchWeather(lat, lon);
      const payload = { apiData, city };
      setCache(payload);
      render(container, payload);
    } catch (err) {
      console.warn('[WeatherModule] Erreur :', err.message);
      renderError(container);
    }
  }

  /* ────────────────────────────────────────────────────────────────
   * DÉMARRAGE
   * ──────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API publique (facultatif)
  return { refresh: init };

})();
