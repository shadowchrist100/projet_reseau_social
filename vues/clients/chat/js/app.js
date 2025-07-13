// ChatApp SPA - Application JavaScript principale
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentChatUser = null;
        this.chatInterval = null;
        this.usersInterval = null;
        this.init();
    }

    init() {
        this.hideLoading();
        this.checkAuth();
        this.bindEvents();
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
    }

    checkAuth() {
        // Vérifier si l'utilisateur est connecté
        fetch('php/check-auth.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.currentUser = data.user;
                    this.showUsersSection();
                    this.loadUsers();
                } else {
                    this.showLoginSection();
                }
            })
            .catch(error => {
                console.error('Erreur de vérification d\'authentification:', error);
                this.showLoginSection();
            });
    }

    bindEvents() {
        // Navigation entre login et signup
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupSection();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginSection();
        });

        // Formulaires
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Recherche d'utilisateurs
        const searchInput = document.querySelector('.search input');
        const searchButton = document.querySelector('.search button');
        
        searchButton.addEventListener('click', () => {
            this.toggleSearch();
        });

        searchInput.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // Navigation
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        document.getElementById('back-to-users').addEventListener('click', (e) => {
            e.preventDefault();
            this.showUsersSection();
        });

        // Envoi de messages
        document.getElementById('typing-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    showLoginSection() {
        this.hideAllSections();
        document.getElementById('login-section').style.display = 'block';
    }

    showSignupSection() {
        this.hideAllSections();
        document.getElementById('signup-section').style.display = 'block';
    }

    showUsersSection() {
        this.hideAllSections();
        document.getElementById('users-section').style.display = 'block';
        this.loadUsers();
        this.startUsersPolling();
    }

    showChatSection() {
        this.hideAllSections();
        document.getElementById('chat-section').style.display = 'block';
        this.startChatPolling();
    }

    hideAllSections() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('users-section').style.display = 'none';
        document.getElementById('chat-section').style.display = 'none';
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        const errorText = form.querySelector('.error-text');

        try {
            const response = await fetch('php/login.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();

            if (result === 'success') {
                // Récupérer les informations de l'utilisateur
                const userResponse = await fetch('php/get-current-user.php');
                const userData = await userResponse.json();
                
                if (userData.success) {
                    this.currentUser = userData.user;
                    this.updateCurrentUserDisplay();
                    this.showUsersSection();
                }
            } else {
                errorText.textContent = result;
                errorText.style.display = 'block';
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            errorText.textContent = 'Erreur de connexion. Veuillez réessayer.';
            errorText.style.display = 'block';
        }
    }

    async handleSignup() {
        const form = document.getElementById('signup-form');
        const formData = new FormData(form);
        const errorText = form.querySelector('.error-text');

        try {
            const response = await fetch('php/signup.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();

            if (result === 'success') {
                // Récupérer les informations de l'utilisateur
                const userResponse = await fetch('php/get-current-user.php');
                const userData = await userResponse.json();
                
                if (userData.success) {
                    this.currentUser = userData.user;
                    this.updateCurrentUserDisplay();
                    this.showUsersSection();
                }
            } else {
                errorText.textContent = result;
                errorText.style.display = 'block';
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            errorText.textContent = 'Erreur d\'inscription. Veuillez réessayer.';
            errorText.style.display = 'block';
        }
    }

    async handleLogout() {
        try {
            await fetch('php/logout.php');
            this.currentUser = null;
            this.stopAllPolling();
            this.showLoginSection();
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        }
    }

    updateCurrentUserDisplay() {
        if (this.currentUser) {
            document.getElementById('current-user-img').src = `php/images/${this.currentUser.profile_picture}`;
            document.getElementById('current-user-name').textContent = `${this.currentUser.prenom} ${this.currentUser.nom}`;
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('php/users.php');
            const html = await response.text();
            document.getElementById('users-list').innerHTML = html;
            
            // Ajouter les événements de clic sur les utilisateurs
            this.bindUserClickEvents();
        } catch (error) {
            console.error('Erreur de chargement des utilisateurs:', error);
        }
    }

    bindUserClickEvents() {
        const userLinks = document.querySelectorAll('#users-list a');
        userLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = link.getAttribute('href').split('=')[1];
                this.openChat(userId);
            });
        });
    }

    async openChat(userId) {
        try {
            const response = await fetch(`php/get-user.php?user_id=${userId}`);
            const userData = await response.json();
            
            if (userData.success) {
                this.currentChatUser = userData.user;
                this.updateChatUserDisplay();
                this.showChatSection();
                this.loadMessages();
            }
        } catch (error) {
            console.error('Erreur d\'ouverture du chat:', error);
        }
    }

    updateChatUserDisplay() {
        if (this.currentChatUser) {
            document.getElementById('chat-user-img').src = `php/images/${this.currentChatUser.profile_picture}`;
            document.getElementById('chat-user-name').textContent = `${this.currentChatUser.prenom} ${this.currentChatUser.nom}`;
            document.querySelector('.incoming_id').value = this.currentChatUser.pseudo;
        }
    }

    async loadMessages() {
        if (!this.currentChatUser) return;

        try {
            const formData = new FormData();
            formData.append('incoming_id', this.currentChatUser.pseudo);

            const response = await fetch('php/get-chat.php', {
                method: 'POST',
                body: formData
            });

            const html = await response.text();
            document.getElementById('chat-box').innerHTML = html;
            
            // Scroll vers le bas
            const chatBox = document.getElementById('chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;

            // Ajouter les événements pour les boutons d'invitation
            this.bindInvitationEvents();
        } catch (error) {
            console.error('Erreur de chargement des messages:', error);
        }
    }

    bindInvitationEvents() {
        const acceptButtons = document.querySelectorAll('.btn-accept');
        const declineButtons = document.querySelectorAll('.btn-decline');

        acceptButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const msgId = button.getAttribute('onclick').match(/\d+/)[0];
                this.respondToInvitation(msgId, 'accepted');
            });
        });

        declineButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const msgId = button.getAttribute('onclick').match(/\d+/)[0];
                this.respondToInvitation(msgId, 'declined');
            });
        });
    }

    async respondToInvitation(msgId, response) {
        try {
            const formData = new FormData();
            formData.append('msg_id', msgId);
            formData.append('response', response);

            const result = await fetch('php/respond-invitation.php', {
                method: 'POST',
                body: formData
            });

            if (result.text() === 'success') {
                this.loadMessages();
            }
        } catch (error) {
            console.error('Erreur de réponse à l\'invitation:', error);
        }
    }

    async sendMessage() {
        if (!this.currentChatUser) return;

        const form = document.getElementById('typing-form');
        const formData = new FormData(form);
        const input = form.querySelector('.input-field');

        if (!input.value.trim()) return;

        try {
            const response = await fetch('php/insert-chat.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.text();

            if (result === 'success') {
                input.value = '';
                this.loadMessages();
            } else if (result === 'blocked') {
                alert('Cette conversation a été bloquée.');
            }
        } catch (error) {
            console.error('Erreur d\'envoi de message:', error);
        }
    }

    toggleSearch() {
        const searchInput = document.querySelector('.search input');
        const searchButton = document.querySelector('.search button');
        
        searchInput.classList.toggle('show');
        searchButton.classList.toggle('active');
        
        if (searchInput.classList.contains('show')) {
            searchInput.focus();
        }
    }

    async searchUsers(searchTerm) {
        if (!searchTerm.trim()) {
            this.loadUsers();
            return;
        }

        try {
            const formData = new FormData();
            formData.append('searchTerm', searchTerm);

            const response = await fetch('php/search.php', {
                method: 'POST',
                body: formData
            });

            const html = await response.text();
            document.getElementById('users-list').innerHTML = html;
            this.bindUserClickEvents();
        } catch (error) {
            console.error('Erreur de recherche:', error);
        }
    }

    startUsersPolling() {
        this.stopUsersPolling();
        this.usersInterval = setInterval(() => {
            this.loadUsers();
        }, 3000);
    }

    stopUsersPolling() {
        if (this.usersInterval) {
            clearInterval(this.usersInterval);
            this.usersInterval = null;
        }
    }

    startChatPolling() {
        this.stopChatPolling();
        this.chatInterval = setInterval(() => {
            this.loadMessages();
        }, 1000);
    }

    stopChatPolling() {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
        }
    }

    stopAllPolling() {
        this.stopUsersPolling();
        this.stopChatPolling();
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
}); 