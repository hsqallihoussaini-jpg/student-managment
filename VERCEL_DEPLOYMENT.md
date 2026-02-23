# Vercel Deployment Guide

## Configuration

Le fichier `vercel.json` contient la configuration optimisée pour le déploiement sur Vercel.

### Variables d'environnement Vercel

Lors du déploiement sur Vercel, assurez-vous de définir les variables d'environnement suivantes dans les paramètres du projet :

1. **NEXTAUTH_SECRET** : Une clé secrète générée aléatoirement (au moins 32 caractères)
   ```bash
   openssl rand -base64 32
   ```

2. **NEXTAUTH_URL** : L'URL de production de votre application
   ```
   https://your-project.vercel.app
   ```

### Configuration 

1. Connectez-vous à [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur "New Project"
3. Sélectionnez votre dépôt GitHub `student-managment`
4. Vercel détectera automatiquement que c'est un projet Next.js
5. Configurez les variables d'environnement dans "Environment Variables"
6. Cliquez sur "Deploy"

### Base de données

La base de données SQLite utilisera le système de fichiers de Vercel. Pour les données persistantes, envisagez :
- Migrer vers une base de données cloud (MongoDB, PostgreSQL, etc.)
- Ou utiliser les Edge Config de Vercel pour les données statiques

### Déploiement

Chaque push vers `main` déploiera automatiquement votre application sur Vercel.

### Commandes de build

- Build : `npm run build`
- Dev : `npm run dev`
- Start : `npm start`

### Points importants

- Le serveur de développement utilise `npm run dev`
- La base de données est initialisée automatiquement au build
- Les routes API sont correctement configurées dans `vercel.json`
- Les variables d'environnement sont chiffrées sur Vercel
