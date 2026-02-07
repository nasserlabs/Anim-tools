# 🚀 Guide de démarrage rapide

## Installation en 3 étapes

### 1️⃣ Télécharger le projet

```bash
# Cloner le repository
git clone https://github.com/votre-username/animtools.git
cd animtools
```

Ou simplement télécharger le ZIP et le décompresser.

### 2️⃣ Lancer en local

**Option A : Double-clic**
- Ouvrir `index.html` directement dans votre navigateur

**Option B : Serveur local (recommandé)**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (si installé)
npx http-server -p 8000

# PHP (si installé)
php -S localhost:8000
```

Puis ouvrir : **http://localhost:8000**

### 3️⃣ Déployer sur GitHub Pages

1. Créer un repository sur GitHub
2. Pusher le code :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/animtools.git
git push -u origin main
```

3. Activer GitHub Pages :
   - Settings > Pages
   - Source : main branch
   - Sauvegarder

4. Accéder au site : `https://VOTRE-USERNAME.github.io/animtools/`

## ✅ Vérification

Le site est fonctionnel si vous pouvez :
- ✅ Naviguer entre les pages
- ✅ Ouvrir la recherche (icône loupe)
- ✅ Filtrer les activités par catégorie
- ✅ Cliquer sur une activité

## 🎨 Personnalisation

### Modifier les couleurs

Dans `css/style.css`, ligne ~10 :

```css
:root {
    --color-accent: #0071e3;  /* Changer cette couleur */
}
```

### Ajouter des activités

Éditer `data/activities.json` et ajouter :

```json
{
  "id": 99,
  "title": "Nouvelle activité",
  "category": "manuelles",
  "age": "6-10 ans",
  "duration": "30 min",
  "difficulty": "Facile",
  "participants": "8-12",
  "description": "Description de l'activité",
  "materials": ["Matériel 1", "Matériel 2"],
  "objectives": ["Objectif 1"],
  "steps": ["Étape 1", "Étape 2"]
}
```

## 🆘 Problèmes courants

**La recherche ne fonctionne pas**
→ Vérifier la console (F12) pour les erreurs
→ S'assurer que `data/activities.json` est accessible

**Les activités ne s'affichent pas**
→ Vérifier que le fichier JSON est valide
→ Utiliser un validateur JSON en ligne

**Le site ne s'affiche pas sur GitHub Pages**
→ Vérifier que le repository est public
→ Attendre 2-3 minutes après activation
→ Vérifier l'URL : `username.github.io/animtools/`

## 📞 Support

Problème ? Ouvrir une issue sur GitHub !

---

**Bon courage ! 🎨**
