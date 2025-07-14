// Configuration de l'application
const AppConfig = {
    // Configuration de l'API
    API: {
        BASE_URL: '/api',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },

    // Configuration des routes
    ROUTES: {
        PUBLIC: ['login', 'register'],
        USER: ['acceuil', 'profil', 'messages', 'publication', 'modifier_profil'],
        ADMIN: ['dashboard-admin', 'users', 'moderators'],
        MODERATOR: ['dashboard-moderator']
    },

    // Configuration des notifications
    NOTIFICATIONS: {
        DURATION: 5000,
        POSITION: 'top-right',
        TYPES: {
            SUCCESS: 'success',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        }
    },

    // Configuration de la pagination
    PAGINATION: {
        ITEMS_PER_PAGE: 10,
        MAX_PAGES_SHOWN: 5
    },

    // Configuration des fichiers
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
        MAX_FILES: 5
    },

    // Configuration de la validation
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        USERNAME_MIN_LENGTH: 3,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[0-9+\-\s()]+$/
    },

    // Configuration des thèmes
    THEMES: {
        LIGHT: {
            primary: '#007bff',
            secondary: '#6c757d',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            light: '#f8f9fa',
            dark: '#343a40'
        },
        DARK: {
            primary: '#0d6efd',
            secondary: '#6c757d',
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0dcaf0',
            light: '#f8f9fa',
            dark: '#212529'
        }
    },

    // Configuration des animations
    ANIMATIONS: {
        DURATION: 300,
        EASING: 'ease-out'
    },

    // Configuration du cache
    CACHE: {
        ENABLED: true,
        DURATION: 5 * 60 * 1000, // 5 minutes
        MAX_SIZE: 50 // nombre maximum d'éléments en cache
    },

    // Configuration des websockets (pour les messages en temps réel)
    WEBSOCKET: {
        ENABLED: false,
        URL: 'ws://localhost:8080',
        RECONNECT_INTERVAL: 5000,
        MAX_RECONNECT_ATTEMPTS: 5
    },

    // Configuration de la sécurité
    SECURITY: {
        CSRF_TOKEN_NAME: 'csrf_token',
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
        PASSWORD_REQUIREMENTS: {
            minLength: 6,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
        }
    },

    // Configuration des fonctionnalités
    FEATURES: {
        REAL_TIME_MESSAGING: false,
        FILE_UPLOAD: true,
        IMAGE_COMPRESSION: true,
        AUTO_SAVE: true,
        OFFLINE_SUPPORT: false
    },

    // Configuration des langues
    LANGUAGES: {
        DEFAULT: 'fr',
        AVAILABLE: ['fr', 'en'],
        TRANSLATIONS: {
            fr: {
                common: {
                    loading: 'Chargement...',
                    error: 'Erreur',
                    success: 'Succès',
                    cancel: 'Annuler',
                    save: 'Enregistrer',
                    delete: 'Supprimer',
                    edit: 'Modifier',
                    close: 'Fermer',
                    confirm: 'Confirmer',
                    back: 'Retour'
                },
                auth: {
                    login: 'Connexion',
                    register: 'Inscription',
                    logout: 'Déconnexion',
                    email: 'Email',
                    password: 'Mot de passe',
                    confirmPassword: 'Confirmer le mot de passe',
                    forgotPassword: 'Mot de passe oublié ?',
                    createAccount: 'Créer un compte',
                    alreadyHaveAccount: 'Déjà un compte ?'
                },
                posts: {
                    create: 'Créer un post',
                    edit: 'Modifier le post',
                    delete: 'Supprimer le post',
                    like: 'J\'aime',
                    unlike: 'Je n\'aime plus',
                    comment: 'Commenter',
                    share: 'Partager',
                    noPosts: 'Aucun post pour le moment'
                },
                profile: {
                    edit: 'Modifier le profil',
                    save: 'Enregistrer les modifications',
                    avatar: 'Photo de profil',
                    name: 'Nom',
                    firstName: 'Prénom',
                    pseudo: 'Pseudo',
                    bio: 'Biographie'
                }
            },
            en: {
                common: {
                    loading: 'Loading...',
                    error: 'Error',
                    success: 'Success',
                    cancel: 'Cancel',
                    save: 'Save',
                    delete: 'Delete',
                    edit: 'Edit',
                    close: 'Close',
                    confirm: 'Confirm',
                    back: 'Back'
                },
                auth: {
                    login: 'Login',
                    register: 'Register',
                    logout: 'Logout',
                    email: 'Email',
                    password: 'Password',
                    confirmPassword: 'Confirm password',
                    forgotPassword: 'Forgot password?',
                    createAccount: 'Create account',
                    alreadyHaveAccount: 'Already have an account?'
                },
                posts: {
                    create: 'Create post',
                    edit: 'Edit post',
                    delete: 'Delete post',
                    like: 'Like',
                    unlike: 'Unlike',
                    comment: 'Comment',
                    share: 'Share',
                    noPosts: 'No posts yet'
                },
                profile: {
                    edit: 'Edit profile',
                    save: 'Save changes',
                    avatar: 'Profile picture',
                    name: 'Name',
                    firstName: 'First name',
                    pseudo: 'Username',
                    bio: 'Biography'
                }
            }
        }
    }
};

// Fonction pour obtenir la traduction
function t(key, language = AppConfig.LANGUAGES.DEFAULT) {
    const keys = key.split('.');
    let translation = AppConfig.LANGUAGES.TRANSLATIONS[language];
    
    for (const k of keys) {
        if (translation && translation[k]) {
            translation = translation[k];
        } else {
            return key; // Retourner la clé si la traduction n'existe pas
        }
    }
    
    return translation;
}

// Fonction pour changer la langue
function changeLanguage(language) {
    if (AppConfig.LANGUAGES.AVAILABLE.includes(language)) {
        localStorage.setItem('app_language', language);
        window.location.reload();
    }
}

// Fonction pour obtenir la langue actuelle
function getCurrentLanguage() {
    return localStorage.getItem('app_language') || AppConfig.LANGUAGES.DEFAULT;
}

// Fonction pour obtenir un paramètre de configuration
function getConfig(path) {
    const keys = path.split('.');
    let config = AppConfig;
    
    for (const key of keys) {
        if (config && config[key] !== undefined) {
            config = config[key];
        } else {
            return null;
        }
    }
    
    return config;
}

// Fonction pour définir un paramètre de configuration
function setConfig(path, value) {
    const keys = path.split('.');
    let config = AppConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!config[keys[i]]) {
            config[keys[i]] = {};
        }
        config = config[keys[i]];
    }
    
    config[keys[keys.length - 1]] = value;
}

// Exposer les fonctions globalement
window.AppConfig = AppConfig;
window.t = t;
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.getConfig = getConfig;
window.setConfig = setConfig; 