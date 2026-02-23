# Documentation Complète - Application de Gestion des Étudiants

## 📋 Résumé du Projet

Une application **full-stack de gestion des étudiants** construite avec les technologies modernes :
- **Next.js 16** (Framework React)
- **NextAuth.js** (Authentification)
- **SQLite** (Base de données)
- **Tailwind CSS** (UI)
- **TypeScript** (Typage)
- **Express** (Routes API)

## 🚀 Fonctionnalités

### 1. **Authentification Sécurisée**
- Login avec email et mot de passe
- Hachage des mots de passe avec bcryptjs
- Gestion des sessions JWT via NextAuth
- Protection des routes

### 2. **Gestion des Étudiants**
- ➕ Ajouter un étudiant avec détails complets
- 👁️ Visualiser les informations d'un étudiant
- ✏️ Modifier les données d'un étudiant
- 🗑️ Supprimer un étudiant
- 📊 Tableau de bord avec statistiques

### 3. **Management des Cours** (API prête)
- Créer et lister les cours
- Associer les étudiants aux cours

### 4. **Interface Utilisateur Responsive**
- Design moderne avec Tailwind CSS
- Navigation intuitive
- Dashboard avec statistiques
- Formulaires validés

## 📁 Structure du Projet

```
student-management/
├── app/
│   ├── api/                                # Routes API
│   │   ├── auth/[...nextauth]/route.ts    # Authentification NextAuth
│   │   ├── students/route.ts               # CRUD étudiants
│   │   ├── students/[id]/route.ts         # Détails étudiant
│   │   └── courses/route.ts                # API Cours
│   ├── dashboard/                          # Pages authentifiées
│   │   ├── page.tsx                       # Tableau de bord
│   │   ├── students/page.tsx              # Liste des étudiants
│   │   ├── students/[id]/page.tsx         # Détails étudiant
│   │   ├── add-student/page.tsx           # Formulaire d'ajout
│   │   └── layout.tsx                     # Layout du dashboard
│   ├── login/page.tsx                     # Page de connexion
│   ├── page.tsx                           # Page d'accueil
│   └── globals.css                        # Styles globaux
├── lib/
│   ├── db.ts                              # Utilitaires SQLite
│   └── auth.ts                            # Configuration NextAuth
├── scripts/
│   └── init-db.js                         # Initialisation BD
├── public/                                 # Fichiers statiques
├── node_modules/                          # Dépendances
├── .env.local                             # Variables d'env (local)
├── .env.example                           # Exemple variables
├── .gitignore                             # Fichiers ignorés
├── .eslintrc.json                         # Config ESLint
├── next.config.js                         # Config Next.js
├── package.json                           # Dépendances npm
├── package-lock.json                      # Lock file
├── postcss.config.js                      # Config PostCSS
├── tailwind.config.ts                     # Config Tailwind
├── tsconfig.json                          # Config TypeScript
├── vercel.json                            # Config Vercel
└── README.md                              # Documentation
```

## 🔧 Installation & Utilisation

### Prérequis
- Node.js v18+
- npm
- git

### Installation Locale

```bash
# Cloner le dépôt
git clone https://github.com/hsqallihoussaini-jpg/student-managment.git
cd student-management

# Installer les dépendances
npm install

# Initialiser la base de données
npm run init-db

# Démarrer le serveur de développement
npm run dev
```

Ouvrer le navigateur à : **http://localhost:3000**

### Identifiants de Test

```
Email: admin@example.com
Mot de passe: admin123
```

## 📊 Endpoints API

### **Authentification**
```
POST   /api/auth/signin      - Connexion
POST   /api/auth/signout     - Déconnexion
GET    /api/auth/session     - Session actuelle
```

### **Étudiants (Authentification requise)**
```
GET    /api/students         - Lister tous les étudiants
POST   /api/students         - Créer un étudiant
GET    /api/students/[id]    - Obtenir un étudiant
PUT    /api/students/[id]    - Modifier un étudiant
DELETE /api/students/[id]    - Supprimer un étudiant
```

### **Cours**
```
GET    /api/courses          - Lister tous les cours
POST   /api/courses          - Créer un cours
```

## 🗄️ Schéma de Base de Données

### Table `users`
```sql
- id (INT PK)
- email (TEXT UNIQUE)
- password (TEXT, hachée)
- name (TEXT)
- role (TEXT)
- createdAt (DATETIME)
```

### Table `students`
```sql
- id (INT PK)
- firstName (TEXT)
- lastName (TEXT)
- email (TEXT UNIQUE)
- phone (TEXT)
- matricule (TEXT UNIQUE)
- dateOfBirth (TEXT)
- address (TEXT)
- city (TEXT)
- zipCode (TEXT)
- country (TEXT)
- enrollmentDate (DATETIME)
- status (TEXT: 'active'/'inactive')
- createdAt (DATETIME)
```

### Table `courses`
```sql
- id (INT PK)
- code (TEXT UNIQUE)
- name (TEXT)
- description (TEXT)
- credits (INT)
- semester (INT)
- createdAt (DATETIME)
```

### Table `enrollments`
```sql
- id (INT PK)
- studentId (INT FK → students)
- courseId (INT FK → courses)
- grade (TEXT)
- enrollmentDate (DATETIME)
```

## 📦 Dépendances Principales

```json
{
  "react": "latest",
  "react-dom": "latest",
  "next": "latest",
  "next-auth": "latest",
  "styled-jsx": "latest",
  "typescript": "latest",
  "tailwindcss": "latest",
  "bcryptjs": "latest",
  "sqlite3": "latest",
  "cors": "latest",
  "express": "latest"
}
```

## 🔐 Sécurité

- ✅ Mots de passe hachés (bcryptjs)
- ✅ Sessions JWT sécurisées
- ✅ CSRF protection (NextAuth)
- ✅ Routes protégées par authentification
- ✅ Variables sensibles en .env
- ✅ CORS configuré

## 🌐 Déploiement Vercel

### Configuration

Le fichier `vercel.json` contient la configuration optimisée pour Vercel.

### Étapes de Déploiement

1. **Créer un compte Vercel** : https://vercel.com

2. **Connecter le dépôt GitHub**
   - Aller à Vercel Dashboard
   - Cliquer "New Project"
   - Sélectionner le dépôt `student-managment`

3. **Configurer les Variables d'Environnement**
   
   Vercel → Project Settings → Environment Variables
   
   ```
   NEXTAUTH_SECRET: <secret-genere>
   NEXTAUTH_URL: https://your-project.vercel.app
   DATABASE_PATH: ./database.db
   ```

4. **Générer une clé secrète NextAuth**
   ```bash
   openssl rand -base64 32
   ```

5. **Déployer**
   - Cliquer "Deploy"
   - Chaque push à `main` redéploiera automatiquement

### Domain Custom

Après le déploiement, vous pouvez ajouter un domaine personnalisé dans les paramètres de projet Vercel.

## 🚀 Scripts Disponibles

```bash
npm run dev       # Démarrer le serveur de dev (hot reload)
npm run build     # Créer une version de production
npm start         # Démarrer le serveur de production
npm run lint      # Exécuter ESLint
npm run init-db   # Initialiser la base de données
```

## 📝 Variables d'Environnement

Créez un fichier `.env.local` :

```env
NEXTAUTH_SECRET=<clé-secrète-générée>
NEXTAUTH_URL=http://localhost:3000
DATABASE_PATH=./database.db
```

Pour la production (Vercel), configurez ces variables dans le dashboard.

## 🐛 Dépannage

### Erreur : "Database not initialized"
```bash
npm run init-db
```

### Erreur : "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### Erreur : "NextAuth configuration error"
- Vérifier que `NEXTAUTH_SECRET` est défini
- Vérifier que `NEXTAUTH_URL` est correct

### Port 3000 déjà utilisé
```bash
npm run dev -- -p 3001
```

## 📖 Documentation Additionnelle

- **Next.js** : https://nextjs.org/docs
- **NextAuth.js** : https://next-auth.js.org
- **Tailwind CSS** : https://tailwindcss.com/docs
- **SQLite** : https://www.sqlite.org/docs.html
- **Vercel** : https://vercel.com/docs

## 👨‍💻 Auteur

**H. SQ**
- Email: h.sqallihoussaini@esisa.ac.ma
- GitHub: https://github.com/hsqallihoussaini-jpg

## 📄 Licence

MIT License

## ✅ Checklist de Déploiement

- [x] Créer la structure Next.js
- [x] Configurer NextAuth pour l'authentification
- [x] Mettre en place SQLite
- [x] Créer les API CRUD des étudiants
- [x] Construire l'interface utilisateur
- [x] Tester l'application localement
- [x] Initialiser Git
- [x] Pousser le code sur GitHub
- [x] Configurer Vercel
- [x] Documenter le projet

---

**Application prête pour la production!** 🎉
