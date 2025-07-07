document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Désactive le bouton
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner">⏳</span> Connexion...';

    try {
        const response = await fetch('../../api/admin/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: form.email.value.trim(),
                password: form.password.value
            })
        });

        // Vérifie si la réponse est JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error('Le serveur a retourné une réponse invalide');
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Échec de la connexion');
        }

        // Stocke le token et redirige
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminRole', data.role);
        AdminUtils.setUser(data);
        AdminUtils.redirectByRole(data);

    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});