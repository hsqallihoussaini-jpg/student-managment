# Gestion des Étudiants

Application full-stack de gestion des étudiants construite avec Next.js, Express, SQLite et NextAuth.

## Fonctionnalités

- 👥 Gestion complète des étudiants (CRUD)
- 📚 Gestion des cours
- 🔐 Authentification sécurisée avec NextAuth
- 📊 Tableau de bord d'administration
- 🗄️ Base de données SQLite
- 🎨 Interface utilisateur responsive avec Tailwind CSS

## Prérequis

- Node.js (v18 ou plus)
- npm ou yarn

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/hsqallihoussaini-jpg/student-managment.git
cd student-management
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env.local
```

4. Générez une clé secrète pour NEXTAUTH_SECRET :
```bash
openssl rand -base64 32
```

Mettez à jour `.env.local` avec la clé générée.

## Utilisation locale

1. Démarrez le serveur de développement :
```bash
npm run dev
```

2. Ouvrez votre navigateur et allez à `http://localhost:3000`

3. Connectez-vous avec les identifiants de test :
   - Email: `admin@example.com`
   - Mot de passe: `admin123`

## Scripts disponibles

```bash
npm run dev     # Démarrer le serveur de développement
npm run build   # Créer une version de production
npm start       # Démarrer le serveur de production
npm run lint    # Exécuter ESLint
```

## Structure du projet

```
student-management/
├── app/
│   ├── api/               # Routes API
│   ├── dashboard/         # Pages du tableau de bord
│   ├── login/            # Page de connexion
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Page d'accueil
│   └── globals.css       # Styles globaux
├── lib/
│   ├── db.ts             # Utilitaires SQLite
│   └── auth.ts           # Configuration NextAuth
├── public/               # Fichiers statiques
├── package.json
├── next.config.js
├── tailwind.config.ts
└── vercel.json          # Configuration Vercel
```

## Déploiement sur Vercel

1. Poussez le code sur GitHub
2. Allez sur [Vercel](https://vercel.com)
3. Créez un nouveau projet et sélectionnez votre dépôt
4. Configurez les variables d'environnement :
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_PATH`
5. Déployez

## Variables d'environnement

| Variable | Description |
|----------|-----------|
| NEXTAUTH_SECRET | Clé secrète pour NextAuth (générer avec openssl rand -base64 32) |
| NEXTAUTH_URL | URL de base de l'application |
| DATABASE_PATH | Chemin vers la base de données SQLite |

## API Endpoints

### Authentification
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Déconnexion
- `GET /api/auth/session` - Obtenir la session

### Étudiants
- `GET /api/students` - Lister tous les étudiants
- `POST /api/students` - Créer un étudiant
- `GET /api/students/[id]` - Obtenir un étudiant
- `PUT /api/students/[id]` - Modifier un étudiant
- `DELETE /api/students/[id]` - Supprimer un étudiant

### Cours
- `GET /api/courses` - Lister tous les cours
- `POST /api/courses` - Créer un cours

## Sécurité

- Les mots de passe sont hachés avec bcryptjs
- NextAuth gère les sessions JWT
- Les routes protégées vérifient l'authentification
- Les données sensibles sont stockées en variables d'environnement

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub.

## Licence

MIT
