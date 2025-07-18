# 🌐 Mon Réseau Social

Un projet collaboratif de création d'un réseau social simple et moderne en PHP, HTML, CSS (via Tailwind CSS) et JavaScript.

## 🧰 Technologies utilisées

- ✅ PHP 8+
- ✅ MySQL / MariaDB
- ✅ HTML5
- ✅ Tailwind CSS
- ✅ JavaScript (Vanilla JS)
- ✅ Git & GitHub (pour la gestion de projet)

---

## 🗂️ Architecture du projet

```
mon-reseau-social/
├── index.html               # Page publique ou point d'entrée
├── assets/                  # Fichiers statiques
│   ├── css/                 # Fichiers Tailwind et personnalisés
│   ├── images/              # Logos, icônes, illustrations
│   └── js/                  # Scripts front-end
├── vues/                   # Fichiers visibles par les utilisateurs
│   ├── clients/             # Pages pour les utilisateurs (login, profil, etc.)
│   └── back-office/         # Pages d'administration
├── api/                     # Scripts PHP côté serveur (auth, posts, etc.)
├── README.md                # Ce fichier
└── .gitignore               # Fichiers/dossiers ignorés par Git
```

---

## ✅ Fonctionnalités (MVP)

- Inscription et connexion utilisateur
- Déconnexion sécurisée
- Création de publications (texte + image)
- Fil d’actualité
- Page de profil avec bio et photo
- Administration (modération, gestion des utilisateurs)
- Likes, commentaires

---

## 🧪 Installation en local

1. Clonez le dépôt :
   ```bash
   git clone git@github.com:shadowchrist100/projet_reseau_social.git
   ```

2. Démarrez votre environnement PHP/MySQL (ex : XAMPP, MAMP, Laragon...)

3. Créez une base de données `social_network` et importez le fichier SQL (à venir)

4. Configurez la connexion à la base dans `api/db.php` :
   ```php
   $host = 'localhost';
   $dbname = 'reseau_social_db';
   $username = 'root';
   $password = ''; // ou votre mot de passe
   ```

5. Accédez à `http://localhost/mon-reseau-social/index.html`

---

## 👥 Conventions de collaboration

- **Branche principale : `main`** (ne pas committer directement)
- **Branche de développement : `dev`**
- Chaque nouvelle fonctionnalité doit être développée sur une **branche `feature/...`**
- Exemple :
  ```bash
  git checkout -b feature/login dev
  ```

- Une fois une tâche terminée, ouvrez une **pull request vers `dev`**
- Tous les commits doivent être clairs et concis

---



## 🤝 Membres de l’équipe

| Nom               | Rôle                     |
|----------------   |--------------------------|
| Abel LEWHE        | Développeur fullstack / coordonnateur |
| WINGNANNOU d'Alex | Backend PHP / API        |
| ...               | Frontend Tailwind / HTML |
| ...               | QA & documentation       |

---

## 📄 Licence

Ce projet est libre et open-source — sous licence MIT *(ou à préciser selon vos besoins)*.

---

## 🚀 À venir

- Déploiement sur un hébergement distant (000webhost, OVH, Vercel…)
- Version mobile avec Flutter ou PWA
- Fonctionnalités avancées : messagerie privée, notifications, etc.
