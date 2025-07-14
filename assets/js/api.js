// API Service - Gestionnaire centralisé des appels API
class APIService {
    constructor() {
        this.baseURL = '/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Vérifier si la réponse est ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Essayer de parser la réponse comme JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Méthodes pour l'authentification
    async login(formData) {
        return this.request('/login.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
    }

    async register(formData) {
        return this.request('/register.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
    }

    async logout() {
        return this.request('/logout.php', {
            method: 'POST'
        });
    }

    async checkSession() {
        return this.request('/session_check.php');
    }

    // Méthodes pour les posts
    async getPosts() {
        return this.request('/get_posts.php');
    }

    async createPost(formData) {
        return this.request('/create_post.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
    }

    async likePost(postId) {
        return this.request('/like.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `post_id=${postId}`
        });
    }

    async commentPost(postId, comment) {
        return this.request('/comment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `post_id=${postId}&comment=${encodeURIComponent(comment)}`
        });
    }

    // Méthodes pour le profil utilisateur
    async getUserProfile() {
        return this.request('/user.php');
    }

    async updateProfile(formData) {
        return this.request('/edit_profil.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });
    }

    // Méthodes pour l'administration
    async getUsers() {
        return this.request('/admin/users.php');
    }

    async getModerators() {
        return this.request('/admin/get_moderators.php');
    }

    async promoteModerator(userId) {
        return this.request('/admin/promote_moderator.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `user_id=${userId}`
        });
    }

    async deleteModerator(userId) {
        return this.request('/admin/delete_moderator.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `user_id=${userId}`
        });
    }

    // Méthode pour gérer les erreurs de manière centralisée
    handleError(error, context = '') {
        console.error(`API Error in ${context}:`, error);
        
        let message = 'Une erreur est survenue';
        
        if (error.message.includes('401')) {
            message = 'Session expirée. Veuillez vous reconnecter.';
            // Rediriger vers la page de connexion
            setTimeout(() => {
                SPARouter.navigate('login');
            }, 2000);
        } else if (error.message.includes('403')) {
            message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.message.includes('404')) {
            message = 'Ressource non trouvée.';
        } else if (error.message.includes('500')) {
            message = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.message.includes('NetworkError')) {
            message = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }

        this.showNotification(message, 'error');
        return message;
    }

    // Méthode pour afficher les notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Ajouter les styles CSS pour l'animation
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                
                .notification-close:hover {
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Gérer la fermeture de la notification
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-fermeture après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Méthode pour valider les formulaires
    validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field) || '';
            
            if (rule.required && !value.trim()) {
                errors[field] = rule.message || `${field} est requis`;
            } else if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field} n'est pas valide`;
            } else if (rule.minLength && value.length < rule.minLength) {
                errors[field] = rule.message || `${field} doit contenir au moins ${rule.minLength} caractères`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = rule.message || `${field} ne doit pas dépasser ${rule.maxLength} caractères`;
            }
        }
        
        return errors;
    }
}

// Créer une instance globale de l'API Service
window.apiService = new APIService();

// Règles de validation communes
window.validationRules = {
    name: {
        required: true,
        minLength: 2,
        message: 'Le nom doit contenir au moins 2 caractères'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Veuillez entrer un email valide'
    },
    password: {
        required: true,
        minLength: 6,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
    },
    pseudo: {
        required: true,
        minLength: 3,
        message: 'Le pseudo doit contenir au moins 3 caractères'
    }
}; 