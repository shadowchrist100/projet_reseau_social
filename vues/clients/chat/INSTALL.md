# Guide d'installation - ChatApp SPA

## 📋 Prérequis

- **Serveur web** : XAMPP, WAMP, MAMP ou équivalent
- **PHP** : Version 7.4 ou supérieure
- **MySQL/MariaDB** : Version 5.7 ou supérieure
- **Navigateur moderne** : Chrome, Firefox, Safari, Edge

## 🚀 Installation étape par étape

### 1. Préparation du serveur

1. **Installez votre serveur web** (XAMPP recommandé)
2. **Démarrez Apache et MySQL**
3. **Placez le projet** dans le dossier `htdocs` (XAMPP) ou `www` (WAMP)

### 2. Configuration de la base de données

1. **Ouvrez phpMyAdmin** (http://localhost/phpmyadmin)
2. **Créez une nouvelle base de données** nommée `chatapp`
3. **Importez le fichier** `database.sql`
4. **Vérifiez que les tables sont créées** :
   - `users`
   - `messages`

### 3. Configuration de l'application

1. **Ouvrez le fichier** `php/config.php`
2. **Modifiez les paramètres** selon votre configuration :

```php
<?php
$host = "localhost";        // Votre hôte MySQL
$username = "root";         // Votre nom d'utilisateur MySQL
$password = "";             // Votre mot de passe MySQL
$database = "chatapp";      // Nom de votre base de données
?>
```

### 4. Configuration des permissions

1. **Donnez les permissions d'écriture** au dossier `php/images/`
   - Windows : Clic droit → Propriétés → Sécurité → Modifier
   - Linux/Mac : `chmod 755 php/images/`

### 5. Test de l'application

1. **Ouvrez votre navigateur**
2. **Accédez à** `http://localhost/Chat_App1.0.0/index.html`
3. **Créez un compte** pour tester l'application

## 🔧 Configuration avancée

### Polling des messages

Pour ajuster la fréquence de mise à jour des messages, modifiez `js/app.js` :

```javascript
// Polling des utilisateurs (3 secondes par défaut)
this.usersInterval = setInterval(() => {
  this.loadUsers();
}, 3000);

// Polling des messages (1 seconde par défaut)
this.chatInterval = setInterval(() => {
  this.loadMessages();
}, 1000);
```

### Taille maximale des fichiers

Pour augmenter la taille maximale des images de profil, modifiez `php.ini` :

```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

### Sécurité

Pour renforcer la sécurité, ajoutez dans `php/config.php` :

```php
// Désactiver l'affichage des erreurs en production
error_reporting(0);
ini_set('display_errors', 0);

// Configuration des sessions sécurisées
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1);
```

## 🐛 Dépannage

### Problème de connexion à la base de données

1. **Vérifiez les paramètres** dans `php/config.php`
2. **Testez la connexion** avec un script simple :

```php
<?php
$conn = mysqli_connect("localhost", "root", "", "chatapp");
if (!$conn) {
    die("Erreur de connexion : " . mysqli_connect_error());
}
echo "Connexion réussie !";
?>
```

### Problème d'upload d'images

1. **Vérifiez les permissions** du dossier `php/images/`
2. **Vérifiez la configuration PHP** pour les uploads
3. **Testez avec une image simple** (JPG, PNG)

### Problème de session

1. **Vérifiez que les sessions PHP** sont activées
2. **Vérifiez les permissions** du dossier temporaire PHP
3. **Redémarrez le serveur web**

### Problème de polling

1. **Vérifiez la console du navigateur** pour les erreurs JavaScript
2. **Vérifiez les logs PHP** pour les erreurs serveur
3. **Testez les endpoints PHP** individuellement

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs d'erreur** de votre serveur web
2. **Consultez la console du navigateur** (F12)
3. **Testez les endpoints PHP** directement
4. **Vérifiez la documentation** dans le README.md

## 🎉 Félicitations !

Votre application ChatApp SPA est maintenant installée et prête à être utilisée !

---

**ChatApp** - Une expérience de chat moderne et intuitive ! 🚀
