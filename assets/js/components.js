// Composants réutilisables pour l'interface utilisateur
class UIComponents {
    constructor() {
        this.init();
    }

    init() {
        // Initialiser les composants après le chargement de la page
        this.initNavigation();
        this.initModals();
        this.initTooltips();
    }

    // Navigation responsive
    initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Fermer le menu lors du clic sur un lien
            const navLinks = navMenu.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    // Gestion des modales
    initModals() {
        // Ouvrir les modales
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-open]')) {
                e.preventDefault();
                const modalId = e.target.getAttribute('data-modal-open');
                this.openModal(modalId);
            }

            // Fermer les modales
            if (e.target.matches('[data-modal-close]') || e.target.classList.contains('modal-overlay')) {
                e.preventDefault();
                this.closeModal();
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus sur le premier élément focusable
            const firstFocusable = modal.querySelector('input, button, textarea, select');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Tooltips
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';

        element.tooltip = tooltip;
    }

    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Créer un bouton de chargement
    createLoadingButton(text = 'Chargement...') {
        const button = document.createElement('button');
        button.className = 'loading-button';
        button.innerHTML = `
            <span class="loading-spinner"></span>
            <span class="button-text">${text}</span>
        `;
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
        `;
        return button;
    }

    // Créer un indicateur de chargement
    createSpinner(size = 'medium') {
        const spinner = document.createElement('div');
        spinner.className = `spinner spinner-${size}`;
        spinner.style.cssText = `
            width: ${size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'};
            height: ${size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'};
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        return spinner;
    }

    // Créer une carte de post
    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <img src="${post.author_avatar || '/assets/images/avatar.jpeg'}" alt="${post.author_name}" class="author-avatar">
                    <div class="author-info">
                        <h4 class="author-name">${post.author_name}</h4>
                        <span class="post-date">${this.formatDate(post.created_at)}</span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn" data-action="like" data-post-id="${post.id}">
                        <i class="uil uil-heart ${post.is_liked ? 'liked' : ''}"></i>
                        <span class="like-count">${post.likes_count || 0}</span>
                    </button>
                    <button class="action-btn" data-action="comment" data-post-id="${post.id}">
                        <i class="uil uil-comment"></i>
                        <span class="comment-count">${post.comments_count || 0}</span>
                    </button>
                    <button class="action-btn" data-action="share" data-post-id="${post.id}">
                        <i class="uil uil-share"></i>
                    </button>
                </div>
            </div>
            <div class="post-content">
                <p class="post-text">${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
            </div>
            <div class="post-comments" id="comments-${post.id}">
                <!-- Les commentaires seront chargés ici -->
            </div>
        `;
        return card;
    }

    // Formater une date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours} h`;
        if (days < 7) return `Il y a ${days} j`;
        
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Créer un formulaire de commentaire
    createCommentForm(postId) {
        const form = document.createElement('form');
        form.className = 'comment-form';
        form.innerHTML = `
            <div class="comment-input-group">
                <input type="text" placeholder="Ajouter un commentaire..." class="comment-input" required>
                <button type="submit" class="comment-submit">
                    <i class="uil uil-message"></i>
                </button>
            </div>
        `;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = form.querySelector('.comment-input');
            const comment = input.value.trim();
            
            if (comment) {
                try {
                    await apiService.commentPost(postId, comment);
                    input.value = '';
                    // Recharger les commentaires
                    this.loadComments(postId);
                } catch (error) {
                    apiService.handleError(error, 'comment');
                }
            }
        });
        
        return form;
    }

    // Charger les commentaires
    async loadComments(postId) {
        const commentsContainer = document.getElementById(`comments-${postId}`);
        if (!commentsContainer) return;

        try {
            const comments = await apiService.getComments(postId);
            commentsContainer.innerHTML = '';
            
            comments.forEach(comment => {
                const commentElement = this.createCommentElement(comment);
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des commentaires:', error);
        }
    }

    // Créer un élément de commentaire
    createCommentElement(comment) {
        const element = document.createElement('div');
        element.className = 'comment';
        element.innerHTML = `
            <div class="comment-author">
                <img src="${comment.author_avatar || '/assets/images/avatar.jpeg'}" alt="${comment.author_name}" class="comment-avatar">
                <div class="comment-info">
                    <span class="comment-author-name">${comment.author_name}</span>
                    <span class="comment-date">${this.formatDate(comment.created_at)}</span>
                </div>
            </div>
            <p class="comment-text">${comment.content}</p>
        `;
        return element;
    }

    // Créer un menu déroulant
    createDropdown(options, selectedValue = null) {
        const select = document.createElement('select');
        select.className = 'dropdown-select';
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (selectedValue && option.value === selectedValue) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        
        return select;
    }

    // Créer une pagination
    createPagination(currentPage, totalPages, onPageChange) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        const ul = document.createElement('ul');
        ul.className = 'pagination-list';
        
        // Bouton précédent
        if (currentPage > 1) {
            const prevLi = document.createElement('li');
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Précédent';
            prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
            prevLi.appendChild(prevBtn);
            ul.appendChild(prevLi);
        }
        
        // Pages
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === currentPage ? 'active' : '';
            btn.addEventListener('click', () => onPageChange(i));
            li.appendChild(btn);
            ul.appendChild(li);
        }
        
        // Bouton suivant
        if (currentPage < totalPages) {
            const nextLi = document.createElement('li');
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Suivant';
            nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
            nextLi.appendChild(nextBtn);
            ul.appendChild(nextLi);
        }
        
        pagination.appendChild(ul);
        return pagination;
    }
}

// Créer une instance globale des composants
window.uiComponents = new UIComponents();

// Styles CSS pour les composants
const componentStyles = `
<style>
/* Navigation responsive */
.nav-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .nav-toggle {
        display: block;
    }
    
    .nav-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .nav-menu.active {
        display: block;
    }
}

/* Modales */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.modal.active {
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
}

.modal-content {
    position: relative;
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

/* Tooltips */
.tooltip {
    position: absolute;
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
    white-space: nowrap;
}

/* Boutons de chargement */
.loading-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 14px;
}

.loading-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* Cartes de posts */
.post-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.post-author {
    display: flex;
    align-items: center;
    gap: 10px;
}

.author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.author-name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}

.post-date {
    font-size: 12px;
    color: #666;
}

.post-actions {
    display: flex;
    gap: 15px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #666;
    font-size: 14px;
}

.action-btn:hover {
    color: #007bff;
}

.action-btn .liked {
    color: #e74c3c;
}

/* Commentaires */
.comment-form {
    margin-top: 10px;
}

.comment-input-group {
    display: flex;
    gap: 10px;
}

.comment-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
}

.comment-submit {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.comment {
    margin-top: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
}

.comment-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
}

.comment-avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
}

.comment-author-name {
    font-weight: 600;
    font-size: 12px;
}

.comment-date {
    font-size: 11px;
    color: #666;
}

.comment-text {
    margin: 0;
    font-size: 14px;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.pagination-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 5px;
}

.pagination-list button {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.pagination-list button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.pagination-list button:hover:not(.active) {
    background: #f8f9fa;
}

/* Dropdown */
.dropdown-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 14px;
    cursor: pointer;
}

.dropdown-select:focus {
    outline: none;
    border-color: #007bff;
}
</style>
`;

// Ajouter les styles au head
document.head.insertAdjacentHTML('beforeend', componentStyles); 