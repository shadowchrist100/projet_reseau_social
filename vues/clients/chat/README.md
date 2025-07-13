# ChatApp - Application de Chat SPA

Une application de chat moderne construite comme une Single Page Application (SPA) avec Ajax.

## 🚀 Fonctionnalités

- **Interface moderne** : Design responsive et élégant
- **Authentification** : Inscription et connexion sécurisées
- **Chat en temps réel** : Messages instantanés avec polling
- **Recherche d'utilisateurs** : Recherche en temps réel
- **Système d'invitation** : Accepter/refuser les conversations
- **Gestion des conversations** : Bloquer les conversations indésirables
- **Upload d'images** : Photos de profil personnalisées

## 📁 Structure du projet

```
Chat_App1.0.0/
├── index.html              # Page principale SPA
├── style.css               # Styles CSS principaux
├── js/
│   └── app.js              # Application JavaScript principale
├── assets/
│   └── css/
│       └── invitation.css  # Styles pour le système d'invitation
├── javascript/
│   └── pass-show-hide.js   # Gestion de l'affichage du mot de passe
├── php/
│   ├── config.php          # Configuration de la base de données
│   ├── check-auth.php      # Vérification d'authentification
│   ├── get-current-user.php # Récupération utilisateur actuel
│   ├── get-user.php        # Récupération utilisateur spécifique
│   ├── login.php           # Connexion
│   ├── signup.php          # Inscription
│   ├── logout.php          # Déconnexion
│   ├── users.php           # Liste des utilisateurs
│   ├── data.php            # Données des utilisateurs
│   ├── search.php          # Recherche d'utilisateurs
│   ├── get-chat.php        # Récupération des messages
│   ├── insert-chat.php     # Envoi de messages
│   └── respond-invitation.php # Réponse aux invitations
└── php/images/             # Images de profil des utilisateurs
```

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Backend** : PHP 7.4+
- **Base de données** : MySQL/MariaDB
- **Architecture** : SPA avec Ajax
- **Design** : Responsive avec Poppins font

## 🚀 Installation

1. **Cloner le projet** dans votre serveur web (XAMPP, WAMP, etc.)

2. **Configurer la base de données** :

   - Créer une base de données `chatapp`
   - Importer le fichier SQL fourni

3. **Configurer la connexion** :

   - Modifier `php/config.php` avec vos paramètres de base de données

4. **Permissions** :

   - Donner les permissions d'écriture au dossier `php/images/`

5. **Accéder à l'application** :
   - Ouvrir `index.html` dans votre navigateur

## 📱 Utilisation

### Connexion/Inscription

- Créez un compte avec votre email, nom, prénom et photo
- Connectez-vous avec vos identifiants

### Chat

- Sélectionnez un utilisateur dans la liste
- Envoyez des messages en temps réel
- Utilisez la recherche pour trouver des utilisateurs

### Système d'invitation

- Les premiers messages sont des invitations
- Acceptez ou refusez les conversations
- Les conversations refusées sont bloquées

## 🔧 Configuration

### Base de données

Modifiez `php/config.php` :

```php
$host = "localhost";
$username = "votre_username";
$password = "votre_password";
$database = "chatapp";
```

### Polling

Ajustez les intervalles de polling dans `js/app.js` :

```javascript
// Polling des utilisateurs (3 secondes)
this.usersInterval = setInterval(() => {
  this.loadUsers();
}, 3000);

// Polling des messages (1 seconde)
this.chatInterval = setInterval(() => {
  this.loadMessages();
}, 1000);
```

## 🎨 Personnalisation

### Couleurs

Modifiez les variables CSS dans `style.css` :

```css
:root {
  --primary-color: #333;
  --secondary-color: #f7f7f7;
  --accent-color: #468669;
}
```

### Styles

- `style.css` : Styles principaux
- `assets/css/invitation.css` : Styles du système d'invitation

## 🔒 Sécurité

- Sessions PHP sécurisées
- Validation des données côté serveur
- Protection contre les injections SQL
- Upload d'images sécurisé

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez le support.

---

**ChatApp** - Une application de chat moderne et intuitive ! 🚀
