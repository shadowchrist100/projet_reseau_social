function init_login() {
    // Récupération des champs du formulaire 
    const login_form = document.querySelector("form");
    const login_nom = document.getElementById("login-name");
    const login_pseudo = document.getElementById("login-pseudo");
    const login_email = document.getElementById("login-email");
    const login_password = document.getElementById("login-password");
    const div_nom = document.querySelector(".nom");
    const div_pseudo = document.querySelector(".pseudo");
    const div_mail = document.querySelector(".mail");
    const div_passw = document.querySelector(".password");
    const mp_forgot = document.getElementById("mp_forgot");

    // Fonction pour afficher les erreurs de validation
    function showFieldError(field, message) {
        const errorDiv = document.querySelector(`.${field}`);
        if (errorDiv) {
            errorDiv.innerHTML = `<span class="error-text">${message}</span>`;
        }
    }

    // Fonction pour effacer les erreurs
    function clearErrors() {
        const errorElements = document.querySelectorAll(".error-text");
        errorElements.forEach(element => {
            element.remove();
        });
    }

    // Ajout d'un écouteur d'évènement pour prévenir la soumission du formulaire
    login_form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        // Effacer les erreurs précédentes
        clearErrors();
        
        // Créer FormData pour la validation
        const formData = new FormData(login_form);
        
        // Validation des champs
        const errors = {};
        
        // Validation du nom
        if (!formData.get('name')?.trim()) {
            errors.name = "Entrez votre nom";
        }
        
        // Validation du pseudo
        if (!formData.get('pseudo')?.trim()) {
            errors.pseudo = "Entrez votre pseudo";
        }
        
        // Validation de l'email
        const email = formData.get('email')?.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = "Entrez votre email";
        } else if (!emailRegex.test(email)) {
            errors.email = "Email invalide";
        }
        
        // Validation du mot de passe
        const password = formData.get('password');
        if (!password || password.length < 6) {
            errors.password = "Le mot de passe doit contenir au moins 6 caractères";
        }
        
        // Afficher les erreurs s'il y en a
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                showFieldError(field, message);
            });
            return;
        }
        
        // Afficher un indicateur de chargement
        const submitBtn = login_form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Connexion en cours...";
        submitBtn.disabled = true;
        
        try {
            // Utiliser le service API centralisé
            const result = await apiService.login(formData);
            
            if (result.error) {
                // Afficher l'erreur de connexion
                const formError = document.getElementById("form-error");
                if (formError) {
                    formError.innerHTML = `<span class="error-text">${result.error}</span>`;
                }
                apiService.showNotification(result.error, 'error');
            } else {
                // Connexion réussie
                apiService.showNotification("Connexion réussie !", 'success');
                
                // Rediriger selon le rôle
                if (result.role === "user") {
                    SPARouter.navigate("acceuil");
                } else if (result.role === "admin") {
                    SPARouter.navigate("dashboard-admin");
                } else if (result.role === "moderator") {
                    SPARouter.navigate("dashboard-moderator");
                }
            }
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            const errorMessage = apiService.handleError(error, 'login');
            const formError = document.getElementById("form-error");
            if (formError) {
                formError.innerHTML = `<span class="error-text">${errorMessage}</span>`;
            }
        } finally {
            // Restaurer le bouton
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Gestion du lien "Créer un compte"
    const createAccountLink = document.getElementById("create_account");
    if (createAccountLink) {
        createAccountLink.addEventListener("click", function(e) {
            e.preventDefault();
            SPARouter.navigate("register");
        });
    }

    // Gestion du lien "Mot de passe oublié"
    if (mp_forgot) {
        mp_forgot.addEventListener("click", function(e) {
            e.preventDefault();
            apiService.showNotification("Fonctionnalité en cours de développement", 'info');
        });
    }

    // Amélioration de l'UX : validation en temps réel
    const fields = [
        { element: login_nom, errorDiv: div_nom, fieldName: 'name' },
        { element: login_pseudo, errorDiv: div_pseudo, fieldName: 'pseudo' },
        { element: login_email, errorDiv: div_mail, fieldName: 'email' },
        { element: login_password, errorDiv: div_passw, fieldName: 'password' }
    ];

    fields.forEach(({ element, errorDiv, fieldName }) => {
        if (element && errorDiv) {
            element.addEventListener('blur', function() {
                const value = this.value.trim();
                let errorMessage = '';
                
                switch (fieldName) {
                    case 'name':
                        if (!value) errorMessage = "Entrez votre nom";
                        break;
                    case 'pseudo':
                        if (!value) errorMessage = "Entrez votre pseudo";
                        break;
                    case 'email':
                        if (!value) {
                            errorMessage = "Entrez votre email";
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            errorMessage = "Email invalide";
                        }
                        break;
                    case 'password':
                        if (!value) {
                            errorMessage = "Entrez votre mot de passe";
                        } else if (value.length < 6) {
                            errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
                        }
                        break;
                }
                
                if (errorMessage) {
                    errorDiv.innerHTML = `<span class="error-text">${errorMessage}</span>`;
                } else {
                    errorDiv.innerHTML = '';
                }
            });
            
            element.addEventListener('input', function() {
                // Effacer l'erreur quand l'utilisateur commence à taper
                if (errorDiv.querySelector('.error-text')) {
                    errorDiv.innerHTML = '';
                }
            });
        }
    });
}

// Initialiser le formulaire de connexion
init_login();