# 🎨 Anim'Tools

> Votre assistant personnel pour l'animation périscolaire

Anim'Tools est une application web conçue pour les animateurs périscolaires. Elle simplifie la préparation, l'organisation et la gestion des activités pour les enfants de 3 à 12 ans.

## ✨ Fonctionnalités

### ✅ Disponibles (V1)

- **Boîte à idées** : Plus de 200 activités classées en 6 catégories
  - Activités manuelles
  - Jeux sportifs
  - Expression (théâtre, danse)
  - Jeux de société
  - Sorties
  - Initiations sportives
  
- **Recherche intelligente** : Trouvez rapidement l'activité parfaite
- **Fiches détaillées** : Âge, durée, matériel, objectifs, étapes
- **Navigation moderne** : Design inspiré d'Apple, fluide et élégant

### 🚧 En développement (V2)

- **Planning** : Organisation journée/semaine
- **Réglementation** : Fiches synthétiques, checklists, quiz BAFA
- **Administratif** : Profil animateur, suivi BAFA, documents modèles
- **Export PDF** : Impression des activités et plannings
- **QR Codes** : Partage rapide d'activités
- **Stockage local** : Sauvegarde de vos données
- **Version mobile** : Application iOS/Android

## 🚀 Installation & Déploiement

### Prérequis
- Aucun ! HTML/CSS/JavaScript vanilla uniquement

### Déploiement GitHub Pages

1. **Créer un repository GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/animtools.git
git push -u origin main
```

2. **Activer GitHub Pages**
   - Aller dans Settings > Pages
   - Source : Deploy from a branch
   - Branch : main / (root)
   - Sauvegarder

3. **Accéder au site**
   - URL : `https://votre-username.github.io/animtools/`

### Développement local

```bash
# Option 1 : Serveur Python
python -m http.server 8000

# Option 2 : Serveur Node.js
npx http-server -p 8000

# Option 3 : Live Server (VS Code)
# Installer l'extension Live Server et cliquer sur "Go Live"
```

Puis ouvrir : `http://localhost:8000`

## 📁 Structure du projet

```
animtools/
├── index.html              # Page d'accueil
├── inventaire.html         # Boîte à idées
├── planning.html           # Planning (à venir)
├── reglementation.html     # Réglementation (à venir)
├── administratif.html      # Administratif (à venir)
├── css/
│   ├── reset.css          # Reset CSS
│   └── style.css          # Styles principaux
├── js/
│   ├── main.js            # Script principal
│   └── search.js          # Module de recherche
├── assets/
│   ├── icons/             # Icônes SVG
│   ├── images/
│   │   ├── activities/    # Images d'activités (.webp)
│   │   └── ui/            # Images UI (.webp)
│   ├── logos/             # Logos du projet
│   └── mascotte/          # Mascotte SVG
├── data/
│   └── activities.json    # Base de données d'activités
└── README.md              # Ce fichier
```

## 🎨 Design

### Inspiration
Design minimaliste inspiré du site web Apple :
- Navigation fixe avec effet blur
- Typographie élégante (SF Pro Display / System fonts)
- Animations fluides et subtiles
- Espacements généreux
- Palette sobre et professionnelle

### Palette de couleurs
```css
--color-primary: #1d1d1f;      /* Texte principal */
--color-accent: #0071e3;       /* Accent bleu */
--color-background: #ffffff;   /* Fond blanc */
--color-surface: #f5f5f7;      /* Fond alternatif */
```

## 🔧 Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Grid, Flexbox, Animations
- **JavaScript Vanilla** : ES6+, Modules, Async/Await
- **JSON** : Base de données d'activités
- **SVG** : Icônes et mascotte

**Aucune dépendance externe** : Pas de framework, pas de librairie, 100% vanilla.

## 📱 Compatibilité

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (responsive design)

## 📊 Données

Les activités sont stockées dans `data/activities.json` :

```json
{
  "activities": [
    {
      "id": 1,
      "title": "Nom de l'activité",
      "category": "manuelles",
      "age": "6-10 ans",
      "duration": "45 min",
      "difficulty": "Facile",
      "participants": "8-12",
      "description": "...",
      "materials": ["..."],
      "objectives": ["..."],
      "steps": ["..."]
    }
  ],
  "categories": [...]
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Ajouter une activité

Éditez `data/activities.json` et ajoutez un nouvel objet dans le tableau `activities`.

## 📝 Licence

© 2026 Anim'Tools. Tous droits réservés.

## 👨‍💻 Auteur

Conçu par des animateurs, pour des animateurs.

## 🗺️ Roadmap

### V1.0 ✅ (Actuel)
- [x] Page d'accueil
- [x] Inventaire d'activités
- [x] Recherche
- [x] Filtres par catégorie
- [x] Design responsive

### V2.0 🚧 (En développement)
- [ ] Module Planning
- [ ] Module Réglementation
- [ ] Module Administratif
- [ ] Export PDF
- [ ] Favoris
- [ ] Partage QR Code

### V3.0 🔮 (Futur)
- [ ] Application mobile (iOS/Android)
- [ ] Mode hors-ligne (PWA)
- [ ] Synchronisation multi-appareils
- [ ] Communauté d'animateurs
- [ ] Partage d'activités personnalisées

## 💡 Idées & Suggestions

Vous avez des idées pour améliorer Anim'Tools ? 
N'hésitez pas à ouvrir une issue sur GitHub !

---

**Bon courage dans vos animations ! 🎨🏃‍♂️🎭**
