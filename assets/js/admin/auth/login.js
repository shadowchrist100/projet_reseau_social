document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminLoginForm');
    if (!form) {
        console.error('Formulaire adminLoginForm non trouvé');
        return;
    }

    // Gestion de la visibilité du mot de passe
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'ri-eye-line' : 'ri-eye-off-line';
            }
        });
    }

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Désactive le bouton
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner">⏳</span> Connexion...';

        try {
            const formData = {
                username: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                rememberMe: document.getElementById('remember-me').checked
            };

            const response = await fetch('../../api/admin/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Stocke le token et redirige
                sessionStorage.setItem('adminToken', data.token);
                sessionStorage.setItem('adminRole', data.admin.role);
                
                // Redirection selon le rôle
                if (data.admin.role === 'admin') {
                    window.location.href = 'dashboard-admin.html';
                } else if (data.admin.role === 'moderator') {
                    window.location.href = 'dashboard-moderator.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                throw new Error(data.message || 'Échec de la connexion');
            }

        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Une erreur est survenue');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});