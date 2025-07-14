document.getElementById('adminRegisterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
      email: document.getElementById('adminEmail').value,
      password: document.getElementById('adminPassword').value,
      role: document.getElementById('adminRole').value
  };

  try {
      const response = await fetch('../../api/admin/register.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
          // Redirection vers login avec message de succès
          window.location.href = `login.html?registered=1&email=${encodeURIComponent(formData.email)}`;
      } else {
          alert(data.message || "Erreur lors de l'inscription");
      }
  } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur de connexion au serveur");
  }
});