# 👑 KINGBOX - Streaming Films, Séries & Animés

> **Coded with ❤️ by Roserick**

**Kingbox** est une plateforme de streaming moderne et ultra-rapide inspirée de l'interface de **Moviebox**, conçue avec une architecture hybride **Web Responsive (PWA) + Capacitor (Android)**.

---

## 🚀 Fonctionnalités Clés

- 🎬 **Catalogue complet multi-catégories :** Films, Séries TV et Animés japonais.
- ⚡ **Expérience Moviebox :**
  - Grand bandeau Hero cinématique avec dégradés immersifs.
  - Carrousels horizontaux avec défilement fluide et aperçus rapides.
  - Badges de qualité (**4K UHD**, **Full HD**, **HDR**) et notes moyennes (⭐).
  - Fiches détaillées avec synopsis, casting, genres et sélecteur d'épisodes par saison.
- 📺 **Lecteur Vidéo Intégré :**
  - Contrôles complets (Lecture, Pause, Barre de défilement, Retour -10s, Volume, Plein écran).
  - Sélecteur de serveurs de streaming (S1, S2, S3).
- 🔍 **Recherche & Filtres Instantanés :**
  - Recherche par titre, genre, acteur.
  - Filtres par catégorie et par genre (Action, Animation, Sci-Fi, Drame, etc.).
- ❤️ **Bibliothèque Personnelle ("Ma Liste") :**
  - Sauvegarde locale des favoris persistante avec compteur dynamique.
- 📱 **100% Responsive & Hybride :**
  - **Barre de navigation mobile** style application native Moviebox.
  - **PWA (Progressive Web App)** : installable en 1 clic sur écran d'accueil sans passer par les stores.
  - **Capacitor Android** : projet Android natif prêt dans le dossier `./android`.
- ✍️ **Signature Roserick :** Présente sur l'ensemble des pages et vues de l'application (`Coded with ❤️ by Roserick`).

---

## 🛠️ Stack Technique

- **Framework :** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styles :** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icônes :** [Lucide React](https://lucide.dev/)
- **Moteur PWA :** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Pont Mobile Hybride :** [@capacitor/core](https://capacitorjs.com/) & `@capacitor/android`

---

## 💻 Démarrage & Commandes

### 1. Lancer l'application en mode Web (Développement)
```bash
cd kingbox
npm run dev
```
Ouvrez l'URL locale (par défaut `http://localhost:5173`) dans votre navigateur ou sur votre smartphone connecté au même réseau WiFi.

### 2. Compiler pour la production Web / PWA
```bash
npm run build
```
Les fichiers prêts pour déploiement (Vercel, Netlify, VPS, GitHub Pages) se trouvent dans le dossier `dist/`.

### 3. Synchroniser et générer l'Application Android (Capacitor)
Le projet Android a déjà été initialisé dans le dossier `kingbox/android`.

Pour répercuter les dernières modifications web sur Android :
```bash
npm run sync:android
```

Pour ouvrir le projet dans Android Studio et générer l'APK :
```bash
npm run open:android
```
*(Ou ouvrez directement le dossier `kingbox/android` dans Android Studio).*

---

## 🔑 Connecter l'API TMDB (The Movie Database)

Un utilitaire est déjà préparé dans [src/utils/tmdb.js](file:///home/roserick/kingbox/src/utils/tmdb.js) si vous souhaitez basculer vers le catalogue mondial en temps réel de TMDB avec votre clé API gratuite.

---

*Développé avec fierté par **Roserick**.*
