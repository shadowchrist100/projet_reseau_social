function init_register() {
    // Récupération des champs du formulaire 
    const register_form = document.querySelector("form");
    const register_nom = document.getElementById("register-name");
    const register_prenom = document.getElementById("register-firstname");
    const register_pseudo = document.getElementById("register-pseudo");
    const register_email = document.getElementById("register-email");
    const register_password = document.getElementById("register-password");
    const register_password_confirm = document.getElementById("register-password_confirm");
    const remember = document.getElementById("remember");
    const login = document.querySelector(".login-button");

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
    register_form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        // Effacer les erreurs précédentes
        clearErrors();
        
        // Créer FormData pour la validation
        const formData = new FormData(register_form);
        
        // Validation des champs
        const errors = {};
        
        // Validation du nom
        if (!formData.get('name')?.trim()) {
            errors.name = "Entrez votre nom";
        }
        
        // Validation du prénom
        if (!formData.get('firstname')?.trim()) {
            errors.firstname = "Entrez votre prénom";
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
        
        // Validation de la confirmation du mot de passe
        const passwordConfirm = formData.get('password_confirm');
        if (password !== passwordConfirm) {
            errors.password_confirm = "Les mots de passe ne correspondent pas";
        }
        
        // Afficher les erreurs s'il y en a
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                showFieldError(field, message);
            });
            return;
        }
        
        // Afficher un indicateur de chargement
        const submitBtn = register_form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Inscription en cours...";
        submitBtn.disabled = true;
        
        try {
            // Utiliser le service API centralisé pour l'inscription
            const result = await apiService.register(formData);
            
            if (result.error) {
                // Afficher l'erreur d'inscription
                const formError = document.getElementById("form-error");
                if (formError) {
                    formError.innerHTML = `<span class="error-text">${result.error}</span>`;
                }
                apiService.showNotification(result.error, 'error');
            } else {
                // Inscription réussie, connecter automatiquement l'utilisateur
                apiService.showNotification("Inscription réussie ! Connexion automatique...", 'success');
                
                try {
                    const loginResult = await apiService.login(formData);
                    
                    if (loginResult.error) {
                        apiService.showNotification("Inscription réussie mais erreur de connexion automatique", 'warning');
                        SPARouter.navigate("login");
                    } else {
                        // Connexion automatique réussie
                        apiService.showNotification("Connexion automatique réussie !", 'success');
                        
                        // Rediriger selon le rôle
                        if (loginResult.role === "user") {
                            SPARouter.navigate("acceuil");
                        } else if (loginResult.role === "admin") {
                            SPARouter.navigate("dashboard-admin");
                        } else if (loginResult.role === "moderator") {
                            SPARouter.navigate("dashboard-moderator");
                        }
                    }
                } catch (loginError) {
                    console.error("Erreur lors de la connexion automatique:", loginError);
                    apiService.showNotification("Inscription réussie mais erreur de connexion automatique", 'warning');
                    SPARouter.navigate("login");
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            const errorMessage = apiService.handleError(error, 'register');
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

    // Gestion du lien "Déjà un compte"
    if (login) {
        login.addEventListener("click", function(e) {
            e.preventDefault();
            SPARouter.navigate("login");
        });
    }

    // Amélioration de l'UX : validation en temps réel
    const fields = [
        { element: register_nom, errorDiv: document.querySelector(".nom"), fieldName: 'name' },
        { element: register_prenom, errorDiv: document.querySelector(".prenom"), fieldName: 'firstname' },
        { element: register_pseudo, errorDiv: document.querySelector(".pseudo"), fieldName: 'pseudo' },
        { element: register_email, errorDiv: document.querySelector(".mail"), fieldName: 'email' },
        { element: register_password, errorDiv: document.querySelector(".password"), fieldName: 'password' },
        { element: register_password_confirm, errorDiv: document.querySelector(".password_confirm"), fieldName: 'password_confirm' }
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
                    case 'firstname':
                        if (!value) errorMessage = "Entrez votre prénom";
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
                    case 'password_confirm':
                        const password = register_password.value;
                        if (!value) {
                            errorMessage = "Confirmez votre mot de passe";
                        } else if (value !== password) {
                            errorMessage = "Les mots de passe ne correspondent pas";
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

    // Validation en temps réel de la confirmation du mot de passe
    if (register_password && register_password_confirm) {
        register_password_confirm.addEventListener('input', function() {
            const password = register_password.value;
            const confirmPassword = this.value;
            const errorDiv = document.querySelector(".password_confirm");
            
            if (confirmPassword && password !== confirmPassword) {
                errorDiv.innerHTML = `<span class="error-text">Les mots de passe ne correspondent pas</span>`;
            } else if (errorDiv.querySelector('.error-text')) {
                errorDiv.innerHTML = '';
            }
        });
    }
}

// Initialiser le formulaire d'inscription
init_register();