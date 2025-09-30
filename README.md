# Fluxy - Extracteur de Relevés Bancaires

![Fluxy Logo](public/next.svg)

Une solution moderne d'extraction automatique de données bancaires utilisant l'intelligence artificielle, conçue spécialement pour les cabinets d'expertise comptable et les professionnels financiers.

## 🚀 Fonctionnalités

### Extraction Intelligente
- **Analyse automatisée** des relevés bancaires PDF avec reconnaissance intelligente
- **Validation des données** en temps réel
- **Précision maximale** grâce à l'IA avancée

### Export Excel
- **Génération automatique** de fichiers Excel formatés
- **Prêt pour les workflows comptables**
- **Formats standardisés** pour une intégration facile

### Traitement par Lot
- **Traitement simultané** de plusieurs fichiers
- **Gain de temps considérable** (réduction de 90% du temps de saisie manuelle)
- **Interface intuitive** pour une efficacité maximale

### Gestion Utilisateur
- **Authentification sécurisée** avec gestion des sessions
- **Rôles et permissions** (utilisateur/administrateur)
- **Interface d'administration** complète

### Interface Comptable
- **Visualisation des données Excel** générées
- **Édition en ligne** des fichiers Excel
- **Correction et validation** des données extraites

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentification**: Sessions HTTP avec cookies
- **Gestion Excel**: Bibliothèque XLSX
- **API**: RESTful API avec FastAPI (backend)
- **Déploiement**: Vercel

## 📋 Prérequis

- Node.js 18+
- npm ou yarn ou pnpm ou bun
- Backend API Fluxy (disponible séparément)

## 🚀 Démarrage Rapide

1. **Cloner le repository**
   ```bash
   git clone https://github.com/BuildFluxy/fluxy-frontend.git
   cd fluxy-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```

   Modifier `.env.local` :
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

5. **Ouvrir [http://localhost:3000](http://localhost:3000)** dans votre navigateur

## 📁 Structure du Projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── login/             # Authentification
│   ├── dashboard/         # Tableau de bord utilisateur
│   ├── batch/             # Traitement par lot
│   ├── comptable/         # Interface comptable
│   ├── admin/             # Administration
│   └── ...
├── components/            # Composants réutilisables
│   ├── AppLayout.tsx      # Layout avec navigation
│   └── ExtractionParametersModal.tsx
└── lib/
    └── api.ts             # Client API
```

## 🔧 Scripts Disponibles

- `npm run dev` - Lance le serveur de développement avec Turbopack
- `npm run build` - Construit l'application pour la production
- `npm run start` - Lance le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## 🌐 Déploiement

### Sur Vercel (Recommandé)

1. **Connecter le repository GitHub** à Vercel
2. **Configurer les variables d'environnement** :
   - `NEXT_PUBLIC_API_URL` : URL de votre API backend
3. **Déployer automatiquement** à chaque push

### Construction Manuelle

```bash
npm run build
npm run start
```

## 🔐 Authentification

L'application utilise un système d'authentification basé sur les sessions HTTP :

- **Connexion** : `/login`
- **Mot de passe oublié** : `/forgot-password`
- **Réinitialisation** : `/reset-password`

Les administrateurs peuvent gérer les utilisateurs via `/admin`.

## 📊 API Backend

L'application communique avec une API FastAPI backend qui fournit :

- Authentification et gestion utilisateurs
- Extraction de données bancaires
- Gestion des fichiers Excel
- Statistiques et métriques

**Repository backend** : [fluxy-backend](https://github.com/BuildFluxy/fluxy-backend)

## 🎨 Personnalisation

### Thème et Styles
- Utilise Tailwind CSS pour le styling
- Polices : Poppins et Dancing Script
- Couleurs : Palette bleue professionnelle

### Configuration
- `next.config.ts` : Configuration Next.js
- `tailwind.config.js` : Configuration Tailwind
- `eslint.config.mjs` : Règles ESLint

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal** : Todé Rosas Behoundja
- **Contact** : [perrierosas@gmail.com](mailto:perrierosas@gmail.com)
- **Portfolio** : [rosasbehoundja.github.io](https://rosasbehoundja.github.io)

## 🙏 Remerciements

- Next.js pour le framework React
- Tailwind CSS pour le système de design
- Vercel pour la plateforme de déploiement
- La communauté open source

---

**Fluxy** - Révolutionner l'extraction de relevés bancaires avec l'IA ✨
