// Configuration globale
const API_BASE_URL = "../../api/admin"
const TOKEN_KEY = "admin_token"
const USER_KEY = "admin_user"

// Utilitaires globaux
class AdminUtils {
  // Gestion du token
  static setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  }

  static getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
  }

  static removeToken() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  // Gestion de l'utilisateur
  static setUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    this.updateUserInterface(user)
  }

  static getUser() {
    const user = sessionStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static updateUserInterface(user) {
    const nameElement = document.getElementById("currentUserName")
    const roleElement = document.getElementById("currentUserRole")

    if (nameElement) {
      nameElement.textContent = `${user.first_name} ${user.last_name}`
    }

    if (roleElement) {
      roleElement.textContent = user.role === "admin" ? "Administrateur" : "Modérateur"
    }

    // Masquer les éléments admin pour les modérateurs
    if (user.role !== "admin") {
      document.body.classList.add("moderator")
    }
  }

  // Requêtes AJAX
  static async makeRequest(url, options = {}) {
    const token = this.getToken()

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, finalOptions)
      const data = await response.json()

      if (response.status === 401) {
        this.handleUnauthorized()
        return null
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur de requête")
      }

      return data
    } catch (error) {
      console.error("Erreur requête:", error)
      this.showNotification(error.message, "error")
      throw error
    }
  }

  // Gestion de l'authentification
  static handleUnauthorized() {
    this.removeToken()
    this.showNotification("Session expirée. Redirection vers la connexion...", "warning")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
  }

  static checkAuth() {
    const token = this.getToken()
    const user = this.getUser()

    if (!token || !user) {
      window.location.href = "login.html"
      return false
    }

    this.updateUserInterface(user)
    return true
  }

  // Notifications
  static showNotification(message, type = "info", duration = 5000) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll(".notification")
    existingNotifications.forEach((notif) => notif.remove())

    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

    // Ajouter les styles si pas déjà présents
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style")
      styles.id = "notification-styles"
      styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    min-width: 300px;
                    max-width: 500px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideInRight 0.3s ease;
                }
                
                .notification-content {
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: white;
                }
                
                .notification-info { background: #17a2b8; }
                .notification-success { background: #28a745; }
                .notification-warning { background: #ffc107; color: #212529; }
                .notification-error { background: #dc3545; }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 5px;
                    border-radius: 3px;
                    opacity: 0.8;
                }
                
                .notification-close:hover {
                    opacity: 1;
                    background: rgba(255,255,255,0.2);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `
      document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    // Auto-suppression
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, duration)
    }
  }

  static getNotificationIcon(type) {
    const icons = {
      info: "info-circle",
      success: "check-circle",
      warning: "exclamation-triangle",
      error: "exclamation-circle",
    }
    return icons[type] || "info-circle"
  }

  // Formatage des dates
  static formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  static formatDateShort(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  static timeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "À l'instant"
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`

    return this.formatDateShort(dateString)
  }

  // Utilitaires de validation
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  static validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
  }

  // Gestion des modales
  static openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  static closeModal(modalId = null) {
    if (modalId) {
      const modal = document.getElementById(modalId)
      if (modal) {
        modal.style.display = "none"
      }
    } else {
      // Fermer toutes les modales
      const modals = document.querySelectorAll(".modal")
      modals.forEach((modal) => {
        modal.style.display = "none"
      })
    }
    document.body.style.overflow = "auto"
  }

  // Confirmation d'action
  static async confirmAction(message, title = "Confirmation") {
    return new Promise((resolve) => {
      const confirmModal = document.createElement("div")
      confirmModal.className = "modal"
      confirmModal.style.display = "block"
      confirmModal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="resolveConfirm(false)">Annuler</button>
                        <button class="btn btn-danger" onclick="resolveConfirm(true)">Confirmer</button>
                    </div>
                </div>
            `

      document.body.appendChild(confirmModal)

      window.resolveConfirm = (result) => {
        confirmModal.remove()
        delete window.resolveConfirm
        resolve(result)
      }
    })
  }

  // Gestion du loading
  static showLoading(element) {
    if (typeof element === "string") {
      element = document.getElementById(element)
    }
    if (element) {
      element.classList.add("loading")
    }
  }

  static hideLoading(element) {
    if (typeof element === "string") {
      element = document.getElementById(element)
    }
    if (element) {
      element.classList.remove("loading")
    }
  }

  // Debounce pour les recherches
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Fonctions globales
function logout() {
  AdminUtils.confirmAction("Êtes-vous sûr de vouloir vous déconnecter ?", "Déconnexion").then((confirmed) => {
    if (confirmed) {
      AdminUtils.removeToken()
      AdminUtils.showNotification("Déconnexion réussie", "success")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1000)
    }
  })
}

function togglePassword() {
  const passwordInput = document.getElementById("password")
  const toggleIcon = document.getElementById("passwordToggleIcon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    toggleIcon.className = "fas fa-eye-slash"
  } else {
    passwordInput.type = "password"
    toggleIcon.className = "fas fa-eye"
  }
}

function closeModal() {
  AdminUtils.closeModal()
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  // Vérifier l'authentification sur toutes les pages sauf login ET register
  if (
    !window.location.pathname.includes("login.html") &&
    !window.location.pathname.includes("register.html")
  ) {
    AdminUtils.checkAuth()
  }

  // Gestion des clics sur les modales (fermeture en cliquant à l'extérieur)
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      AdminUtils.closeModal()
    }
  })

  // Gestion de la touche Escape pour fermer les modales
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      AdminUtils.closeModal()
    }
  })
})

// Export pour utilisation dans d'autres fichiers
window.AdminUtils = AdminUtils
