// Gestionnaire de vues dynamiques et templates
class ViewManager {
    constructor() {
        this.templates = {};
        this.cache = new Map();
        this.init();
    }

    init() {
        // Écouter les changements de vue
        window.addEventListener('viewChanged', (e) => {
            this.handleViewChange(e.detail);
        });
    }

    // Gérer le changement de vue
    handleViewChange(detail) {
        const { route, config } = detail;
        
        // Initialiser les composants spécifiques à la vue
        switch (route) {
            case 'acceuil':
                this.initAccueilView();
                break;
            case 'profil':
                this.initProfilView();
                break;
            case 'messages':
                this.initMessagesView();
                break;
            case 'publication':
                this.initPublicationView();
                break;
            case 'dashboard-admin':
                this.initAdminDashboard();
                break;
            case 'dashboard-moderator':
                this.initModeratorDashboard();
                break;
        }
    }

    // Initialiser la vue d'accueil
    async initAccueilView() {
        try {
            // Charger les posts
            const posts = await apiService.getPosts();
            this.renderPosts(posts);
            
            // Initialiser les événements de like et commentaire
            this.initPostInteractions();
            
            // Initialiser le formulaire de création de post
            this.initCreatePostForm();
            
        } catch (error) {
            apiService.handleError(error, 'accueil');
        }
    }

    // Rendre les posts
    renderPosts(posts) {
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;

        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="uil uil-postcard"></i>
                    <h3>Aucun post pour le moment</h3>
                    <p>Soyez le premier à partager quelque chose !</p>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postCard = uiComponents.createPostCard(post);
            postsContainer.appendChild(postCard);
        });
    }

    // Initialiser les interactions avec les posts
    initPostInteractions() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('[data-action="like"]')) {
                const button = e.target.closest('[data-action="like"]');
                const postId = button.getAttribute('data-post-id');
                
                try {
                    await apiService.likePost(postId);
                    // Mettre à jour l'interface
                    this.toggleLikeButton(button);
                } catch (error) {
                    apiService.handleError(error, 'like');
                }
            }
            
            if (e.target.closest('[data-action="comment"]')) {
                const button = e.target.closest('[data-action="comment"]');
                const postId = button.getAttribute('data-post-id');
                this.showCommentModal(postId);
            }
        });
    }

    // Basculer le bouton like
    toggleLikeButton(button) {
        const icon = button.querySelector('i');
        const countSpan = button.querySelector('.like-count');
        
        if (icon.classList.contains('liked')) {
            icon.classList.remove('liked');
            countSpan.textContent = parseInt(countSpan.textContent) - 1;
        } else {
            icon.classList.add('liked');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;
        }
    }

    // Afficher la modale de commentaire
    showCommentModal(postId) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h3>Ajouter un commentaire</h3>
                <form class="comment-form-modal">
                    <textarea placeholder="Votre commentaire..." required></textarea>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" data-modal-close>Annuler</button>
                        <button type="submit" class="btn-primary">Commenter</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la soumission du commentaire
        const form = modal.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textarea = form.querySelector('textarea');
            const comment = textarea.value.trim();
            
            if (comment) {
                try {
                    await apiService.commentPost(postId, comment);
                    uiComponents.closeModal();
                    apiService.showNotification('Commentaire ajouté !', 'success');
                    // Recharger les commentaires
                    uiComponents.loadComments(postId);
                } catch (error) {
                    apiService.handleError(error, 'comment');
                }
            }
        });
    }

    // Initialiser le formulaire de création de post
    initCreatePostForm() {
        const form = document.querySelector('.create-post-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Publication...';
            submitBtn.disabled = true;
            
            try {
                await apiService.createPost(formData);
                form.reset();
                apiService.showNotification('Post publié avec succès !', 'success');
                
                // Recharger les posts
                const posts = await apiService.getPosts();
                this.renderPosts(posts);
                
            } catch (error) {
                apiService.handleError(error, 'create_post');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initialiser la vue de profil
    async initProfilView() {
        try {
            const userProfile = await apiService.getUserProfile();
            this.renderUserProfile(userProfile);
            
            // Initialiser les événements de modification de profil
            this.initProfileEditEvents();
            
        } catch (error) {
            apiService.handleError(error, 'profil');
        }
    }

    // Rendre le profil utilisateur
    renderUserProfile(profile) {
        const profileContainer = document.querySelector('.profile-container');
        if (!profileContainer) return;

        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${profile.profile_picture || '/assets/images/avatar.jpeg'}" alt="${profile.name}">
                </div>
                <div class="profile-info">
                    <h2>${profile.name} ${profile.prenom}</h2>
                    <p class="profile-pseudo">@${profile.pseudo}</p>
                    <p class="profile-email">${profile.email}</p>
                </div>
                <button class="btn-primary" data-action="edit-profile">Modifier le profil</button>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-number">${profile.posts_count || 0}</span>
                    <span class="stat-label">Posts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.followers_count || 0}</span>
                    <span class="stat-label">Abonnés</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${profile.following_count || 0}</span>
                    <span class="stat-label">Abonnements</span>
                </div>
            </div>
        `;
    }

    // Initialiser les événements de modification de profil
    initProfileEditEvents() {
        const editBtn = document.querySelector('[data-action="edit-profile"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                SPARouter.navigate('modifier_profil');
            });
        }
    }

    // Initialiser la vue des messages
    initMessagesView() {
        // Initialiser la liste des conversations
        this.loadConversations();
        
        // Initialiser les événements de chat
        this.initChatEvents();
    }

    // Charger les conversations
    async loadConversations() {
        const conversationsContainer = document.querySelector('.conversations-list');
        if (!conversationsContainer) return;

        try {
            // Ici vous pouvez ajouter l'appel API pour charger les conversations
            // const conversations = await apiService.getConversations();
            
            // Pour l'instant, afficher un message
            conversationsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="uil uil-comment-dots"></i>
                    <h3>Aucune conversation</h3>
                    <p>Commencez à discuter avec vos amis !</p>
                </div>
            `;
        } catch (error) {
            apiService.handleError(error, 'conversations');
        }
    }

    // Initialiser les événements de chat
    initChatEvents() {
        // Gérer l'envoi de messages
        const messageForm = document.querySelector('.message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = messageForm.querySelector('input[type="text"]');
                const message = input.value.trim();
                
                if (message) {
                    // Ici vous pouvez ajouter l'envoi du message
                    input.value = '';
                }
            });
        }
    }

    // Initialiser la vue de publication
    initPublicationView() {
        const form = document.querySelector('.publication-form');
        if (!form) return;

        // Gérer la prévisualisation d'image
        const imageInput = form.querySelector('input[type="file"]');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.previewImage(file);
                }
            });
        }

        // Gérer la soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Publication...';
            submitBtn.disabled = true;
            
            try {
                await apiService.createPost(formData);
                form.reset();
                apiService.showNotification('Post publié avec succès !', 'success');
                SPARouter.navigate('acceuil');
            } catch (error) {
                apiService.handleError(error, 'publication');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Prévisualiser une image
    previewImage(file) {
        const reader = new FileReader();
        const previewContainer = document.querySelector('.image-preview');
        
        if (!previewContainer) return;
        
        reader.onload = (e) => {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                    <i class="uil uil-times"></i>
                </button>
            `;
            previewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
    }

    // Initialiser le dashboard admin
    async initAdminDashboard() {
        try {
            const users = await apiService.getUsers();
            this.renderUsersTable(users);
            
            // Initialiser les événements d'administration
            this.initAdminEvents();
            
        } catch (error) {
            apiService.handleError(error, 'admin_dashboard');
        }
    }

    // Rendre le tableau des utilisateurs
    renderUsersTable(users) {
        const tableContainer = document.querySelector('.users-table-container');
        if (!tableContainer) return;

        const table = document.createElement('table');
        table.className = 'users-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.name} ${user.prenom}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>
                            ${user.role === 'user' ? 
                                `<button class="btn-small btn-primary" data-action="promote" data-user-id="${user.id}">Promouvoir</button>` :
                                user.role === 'moderator' ?
                                `<button class="btn-small btn-danger" data-action="demote" data-user-id="${user.id}">Rétrograder</button>` :
                                ''
                            }
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    }

    // Initialiser les événements d'administration
    initAdminEvents() {
        document.addEventListener('click', async (e) => {
            if (e.target.matches('[data-action="promote"]')) {
                const userId = e.target.getAttribute('data-user-id');
                try {
                    await apiService.promoteModerator(userId);
                    apiService.showNotification('Utilisateur promu modérateur !', 'success');
                    // Recharger la liste
                    const users = await apiService.getUsers();
                    this.renderUsersTable(users);
                } catch (error) {
                    apiService.handleError(error, 'promote');
                }
            }
            
            if (e.target.matches('[data-action="demote"]')) {
                const userId = e.target.getAttribute('data-user-id');
                try {
                    await apiService.deleteModerator(userId);
                    apiService.showNotification('Modérateur rétrogradé !', 'success');
                    // Recharger la liste
                    const users = await apiService.getUsers();
                    this.renderUsersTable(users);
                } catch (error) {
                    apiService.handleError(error, 'demote');
                }
            }
        });
    }

    // Initialiser le dashboard modérateur
    async initModeratorDashboard() {
        try {
            // Charger les données spécifiques aux modérateurs
            apiService.showNotification('Dashboard modérateur chargé', 'info');
        } catch (error) {
            apiService.handleError(error, 'moderator_dashboard');
        }
    }
}

// Créer une instance globale du gestionnaire de vues
window.viewManager = new ViewManager(); 