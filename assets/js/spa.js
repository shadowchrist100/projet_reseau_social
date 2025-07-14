// SPA Router - Gestionnaire de navigation sans rechargement
class SPARouter {
    constructor() {
        this.routes = {
            'login': {
                view: '/vues/clients/login.html',
                css: '/assets/css/style_login.css',
                js: '/assets/js/login.js',
                title: 'Connexion'
            },
            'register': {
                view: '/vues/clients/register.html',
                css: '/assets/css/style_register.css',
                js: '/assets/js/register.js',
                title: 'Inscription'
            },
            'acceuil': {
                view: '/vues/clients/acceuil.html',
                css: '/assets/css/style_acceuil.css',
                js: '/assets/js/acceuil.js',
                title: 'Accueil'
            },
            'profil': {
                view: '/vues/clients/profil.html',
                css: '/assets/css/style_profil.css',
                js: '/assets/js/profil.js',
                title: 'Profil'
            },
            'messages': {
                view: '/vues/clients/messages.html',
                css: '/assets/css/style_messages.css',
                js: '/assets/js/messages.js',
                title: 'Messages'
            },
            'publication': {
                view: '/vues/clients/publication.html',
                css: '/assets/css/style_publication.css',
                js: '/assets/js/publication.js',
                title: 'Publication'
            },
            'modifier_profil': {
                view: '/vues/clients/modifier_profil.html',
                css: '/assets/css/style_modifier_profil.css',
                js: '/assets/js/modifier_profil.js',
                title: 'Modifier Profil'
            },
            'dashboard': {
                view: '/vues/back-office/dashboard.html',
                css: '/assets/css/style_dashboard.css',
                js: '/assets/js/dashboard.js',
                title: 'Dashboard'
            },
            'dashboard-admin': {
                view: '/vues/back-office/dashboard-admin.html',
                css: '/assets/css/admin.css',
                js: '/assets/js/admin/dashboard-admin.js',
                title: 'Dashboard Admin'
            },
            'dashboard-moderator': {
                view: '/vues/back-office/dashboard-moderator.html',
                css: '/assets/css/admin.css',
                js: '/assets/js/admin/dashboard-moderator.js',
                title: 'Dashboard Modérateur'
            }
        };
        
        this.currentRoute = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        // Vérifier l'authentification au démarrage
        this.checkAuth();
        
        // Écouter les clics sur les liens pour la navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Écouter les changements d'URL (pour le bouton retour)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.loadView(e.state.route, false);
            }
        });
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/session_check.php');
            const data = await response.json();
            
            if (data.authenticated) {
                if (data.role === 'user') {
                    this.navigate('acceuil');
                } else if (data.role === 'admin') {
                    this.navigate('dashboard-admin');
                } else if (data.role === 'moderator') {
                    this.navigate('dashboard-moderator');
                }
            } else {
                this.navigate('login');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification d\'authentification:', error);
            this.navigate('login');
        }
    }

    async navigate(route, updateHistory = true) {
        if (this.isLoading || this.currentRoute === route) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            await this.loadView(route, updateHistory);
            this.currentRoute = route;
        } catch (error) {
            console.error('Erreur lors de la navigation:', error);
            this.showError('Erreur lors du chargement de la page');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadView(route, updateHistory = true) {
        const routeConfig = this.routes[route];
        if (!routeConfig) {
            throw new Error(`Route ${route} non trouvée`);
        }

        // Charger le HTML
        const htmlResponse = await fetch(routeConfig.view);
        if (!htmlResponse.ok) {
            throw new Error(`Erreur lors du chargement de ${routeConfig.view}`);
        }
        const html = await htmlResponse.text();

        // Mettre à jour le contenu
        document.getElementById('app').innerHTML = html;
        document.title = `ChatApp | ${routeConfig.title}`;

        // Charger le CSS
        this.loadCSS(routeConfig.css);

        // Charger le JavaScript
        await this.loadJS(routeConfig.js);

        // Mettre à jour l'historique si nécessaire
        if (updateHistory) {
            window.history.pushState({ route }, routeConfig.title, `#${route}`);
        }

        // Déclencher un événement personnalisé pour notifier le changement de vue
        window.dispatchEvent(new CustomEvent('viewChanged', { detail: { route, config: routeConfig } }));
    }

    loadCSS(href) {
        // Supprimer l'ancien CSS s'il existe
        const oldStyle = document.getElementById('spa-style');
        if (oldStyle) {
            oldStyle.remove();
        }

        // Ajouter le nouveau CSS
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = href;
        style.id = 'spa-style';
        document.head.appendChild(style);
    }

    async loadJS(src) {
        return new Promise((resolve, reject) => {
            // Supprimer l'ancien script s'il existe
            const oldScript = document.getElementById('spa-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Ajouter le nouveau script
            const script = document.createElement('script');
            script.src = `${src}?t=${new Date().getTime()}`;
            script.id = 'spa-script';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    showLoading() {
        const loading = document.createElement('div');
        loading.id = 'spa-loading';
        loading.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Chargement...</p>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.getElementById('spa-loading');
        if (loading) {
            loading.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div class="error-message">
                <h3>Erreur</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()">Recharger</button>
            </div>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        `;
        document.body.appendChild(errorDiv);
    }

    // Méthode pour forcer la navigation (utilisée par les autres scripts)
    static navigate(route) {
        if (window.spaRouter) {
            window.spaRouter.navigate(route);
        }
    }
}

        // Initialiser le routeur SPA
document.addEventListener('DOMContentLoaded', () => {
    // Charger les services API et composants
    const configScript = document.createElement('script');
    configScript.src = '/assets/js/config.js';
    document.head.appendChild(configScript);
    
    const apiScript = document.createElement('script');
    apiScript.src = '/assets/js/api.js';
    document.head.appendChild(apiScript);
    
    const componentsScript = document.createElement('script');
    componentsScript.src = '/assets/js/components.js';
    document.head.appendChild(componentsScript);
    
    const viewsScript = document.createElement('script');
    viewsScript.src = '/assets/js/views.js';
    document.head.appendChild(viewsScript);
    
    // Initialiser le routeur après le chargement des services
    setTimeout(() => {
        window.spaRouter = new SPARouter();
        
        // Rendre la fonction load_view disponible globalement pour la compatibilité
        window.load_view = (route) => {
            SPARouter.navigate(route);
        };
    }, 100);
});

// Styles CSS pour le loading spinner
const loadingStyles = `
<style>
.loading-spinner {
    text-align: center;
    color: white;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-message {
    text-align: center;
}

.error-message button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.error-message button:hover {
    background: #0056b3;
}
</style>
`;

// Ajouter les styles au head
document.head.insertAdjacentHTML('beforeend', loadingStyles); 