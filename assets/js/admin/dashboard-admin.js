import { Chart } from "@/components/ui/chart"
let platformChart = null
let usersChart = null
const AdminUtils = window.AdminUtils
const API_BASE_URL = "../../api/admin"

document.addEventListener("DOMContentLoaded", () => {
  // Vérifier que l'utilisateur est bien un administrateur
  const user = AdminUtils.getUser()
  if (!user || user.role !== "admin") {
    AdminUtils.showNotification("Accès non autorisé - Droits administrateur requis", "error")
    window.location.href = "login.html"
    return
  }

  loadAdminDashboard()

  // Actualisation automatique toutes les 5 minutes
  setInterval(loadAdminDashboard, 5 * 60 * 1000)
})

async function loadAdminDashboard() {
  try {
    AdminUtils.showLoading("content-body")

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/dashboard-admin.php`)

    if (data && data.success) {
      updateAdminStats(data.stats)
      updateAdvancedMetrics(data.metrics)
      updateSystemAlerts(data.alerts)
      updateRecentActivity(data.recent_activity)
      updatePlatformChart(data.platform_data)
      updateUsersChart(data.users_data)
      updateSystemLogs(data.system_logs)
    }
  } catch (error) {
    console.error("Erreur chargement dashboard admin:", error)
    AdminUtils.showNotification("Erreur lors du chargement du dashboard", "error")
  } finally {
    AdminUtils.hideLoading("content-body")
  }
}

function updateAdminStats(stats) {
  document.getElementById("totalUsers").textContent = stats.total_users || 0
  document.getElementById("totalArticles").textContent = stats.total_articles || 0
  document.getElementById("totalAdmins").textContent = stats.total_admins || 0
  document.getElementById("systemLoad").textContent = `${stats.system_load || 0}%`

  document.getElementById("newUsers").textContent = `+${stats.new_users || 0} cette semaine`
  document.getElementById("articlesToday").textContent = `+${stats.articles_today || 0} aujourd'hui`
  document.getElementById("activeAdmins").textContent = `${stats.active_admins || 0} actifs`
  document.getElementById("serverStatus").textContent = stats.server_status || "Optimal"

  // Mise à jour du statut système
  const statusIndicator = document.querySelector(".status-indicator")
  if (stats.system_load > 80) {
    statusIndicator.className = "status-indicator warning"
    statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Charge Élevée'
  } else if (stats.system_load > 60) {
    statusIndicator.className = "status-indicator caution"
    statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Surveillance'
  } else {
    statusIndicator.className = "status-indicator online"
    statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Système Opérationnel'
  }

  // Animation des compteurs
  animateCounters()
}

function updateAdvancedMetrics(metrics) {
  document.getElementById("growthRate").textContent = `+${metrics.growth_rate || 0}%`
  document.getElementById("engagementRate").textContent = `${metrics.engagement_rate || 0}%`
  document.getElementById("securityScore").textContent = `${metrics.security_score || 0}/100`
  document.getElementById("storageUsed").textContent = metrics.storage_used || "0GB"

  // Mise à jour des couleurs selon les valeurs
  updateMetricColor("growthRate", metrics.growth_rate, 10, 5)
  updateMetricColor("engagementRate", metrics.engagement_rate, 70, 50)
  updateMetricColor("securityScore", metrics.security_score, 90, 70)
}

function updateMetricColor(elementId, value, goodThreshold, warningThreshold) {
  const element = document.getElementById(elementId)
  element.className = "value"

  if (value >= goodThreshold) {
    element.classList.add("good")
  } else if (value >= warningThreshold) {
    element.classList.add("warning")
  } else {
    element.classList.add("danger")
  }
}

function updateSystemAlerts(alerts) {
  const container = document.getElementById("systemAlerts")

  if (!alerts || alerts.length === 0) {
    container.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <div class="alert-content">
                    <h4>Système Stable</h4>
                    <p>Aucune alerte système active</p>
                </div>
            </div>
        `
    return
  }

  container.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert alert-${alert.level}">
            <i class="fas fa-${getAlertIcon(alert.level)}"></i>
            <div class="alert-content">
                <h4>${escapeHtml(alert.title)}</h4>
                <p>${escapeHtml(alert.message)}</p>
                <small>${AdminUtils.timeAgo(alert.created_at)}</small>
            </div>
            <div class="alert-actions">
                <button class="btn btn-sm btn-outline" onclick="dismissAlert(${alert.id})">
                    Ignorer
                </button>
                ${alert.action_url ? `<button class="btn btn-sm btn-primary" onclick="window.location.href='${alert.action_url}'">Résoudre</button>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

function updateRecentActivity(activity) {
  // Nouveaux utilisateurs
  const usersContainer = document.getElementById("recentUsers")
  if (activity.users && activity.users.length > 0) {
    usersContainer.innerHTML = activity.users
      .map(
        (user) => `
            <div class="activity-item">
                <div class="activity-avatar">
                    ${user.first_name.charAt(0)}${user.last_name.charAt(0)}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</div>
                    <div class="activity-meta">
                        @${escapeHtml(user.username)} • 
                        Inscrit ${AdminUtils.timeAgo(user.created_at)}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  } else {
    usersContainer.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun nouvel utilisateur</p>'
  }

  // Articles récents
  const articlesContainer = document.getElementById("recentArticles")
  if (activity.articles && activity.articles.length > 0) {
    articlesContainer.innerHTML = activity.articles
      .map(
        (article) => `
            <div class="activity-item">
                <div class="activity-avatar">
                    ${article.author_first_name.charAt(0)}${article.author_last_name.charAt(0)}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${escapeHtml(article.title)}</div>
                    <div class="activity-meta">
                        Par ${escapeHtml(article.author_first_name)} ${escapeHtml(article.author_last_name)} • 
                        ${AdminUtils.timeAgo(article.created_at)}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  } else {
    articlesContainer.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun article récent</p>'
  }

  // Activité admin
  const adminContainer = document.getElementById("adminActivity")
  if (activity.admin_actions && activity.admin_actions.length > 0) {
    adminContainer.innerHTML = activity.admin_actions
      .map(
        (action) => `
            <div class="activity-item">
                <div class="activity-avatar admin-avatar">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${getActionLabel(action.action)}</div>
                    <div class="activity-meta">
                        Par ${escapeHtml(action.admin_name)} • 
                        ${AdminUtils.timeAgo(action.created_at)}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  } else {
    adminContainer.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucune activité récente</p>'
  }
}

function updatePlatformChart(platformData) {
  const ctx = document.getElementById("platformChart").getContext("2d")

  if (platformChart) {
    platformChart.destroy()
  }

  const labels = platformData.map((data) => data.date)
  const usersData = platformData.map((data) => data.users)
  const articlesData = platformData.map((data) => data.articles)

  platformChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nouveaux utilisateurs",
          data: usersData,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Nouveaux articles",
          data: articlesData,
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  })
}

function updateUsersChart(usersData) {
  const ctx = document.getElementById("usersChart").getContext("2d")

  if (usersChart) {
    usersChart.destroy()
  }

  usersChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Utilisateurs Actifs", "Utilisateurs Inactifs", "Utilisateurs Suspendus"],
      datasets: [
        {
          data: [usersData.active, usersData.inactive, usersData.suspended],
          backgroundColor: ["#27ae60", "#95a5a6", "#e74c3c"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  })
}

function updateSystemLogs(logs) {
  const container = document.getElementById("systemLogs")

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun log système récent</p>'
    return
  }

  container.innerHTML = logs
    .map(
      (log) => `
        <div class="log-item ${log.level.toLowerCase()}">
            <div class="log-level">
                <i class="fas fa-${getLogIcon(log.level)}"></i>
                ${log.level}
            </div>
            <div class="log-content">
                <div class="log-message">${escapeHtml(log.message)}</div>
                <div class="log-time">${AdminUtils.formatDate(log.created_at)}</div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Fonctions utilitaires
function getAlertIcon(level) {
  const icons = {
    info: "info-circle",
    warning: "exclamation-triangle",
    error: "exclamation-circle",
    success: "check-circle",
  }
  return icons[level] || "info-circle"
}

function getLogIcon(level) {
  const icons = {
    INFO: "info-circle",
    WARNING: "exclamation-triangle",
    ERROR: "times-circle",
    DEBUG: "bug",
  }
  return icons[level] || "info-circle"
}

function getActionLabel(action) {
  const labels = {
    CREATE_ADMIN: "Création administrateur",
    DELETE_ADMIN: "Suppression administrateur",
    CREATE_USER: "Création utilisateur",
    DELETE_USER: "Suppression utilisateur",
    SYSTEM_BACKUP: "Sauvegarde système",
    SYSTEM_UPDATE: "Mise à jour système",
  }
  return labels[action] || action
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-content h3")

  counters.forEach((counter) => {
    const target = Number.parseInt(counter.textContent.replace(/[^\d]/g, ""))
    const increment = target / 50
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        counter.textContent = target
        clearInterval(timer)
      } else {
        counter.textContent = Math.floor(current)
      }
    }, 30)
  })
}

// Actions administrateur
function openCreateAdminModal() {
  AdminUtils.openModal("createAdminModal")
}

async function createAdmin() {
  const formData = {
    username: document.getElementById("adminUsername").value.trim(),
    email: document.getElementById("adminEmail").value.trim(),
    first_name: document.getElementById("adminFirstName").value.trim(),
    last_name: document.getElementById("adminLastName").value.trim(),
    role: document.getElementById("adminRole").value,
    password: document.getElementById("adminPassword").value,
  }

  // Validation
  if (!formData.username || !formData.email || !formData.first_name || !formData.last_name || !formData.password) {
    AdminUtils.showNotification("Veuillez remplir tous les champs", "error")
    return
  }

  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/register.php`, {
      method: "POST",
      body: JSON.stringify(formData),
    })

    if (data && data.success) {
      AdminUtils.showNotification("Administrateur créé avec succès", "success")
      AdminUtils.closeModal("createAdminModal")
      document.getElementById("createAdminForm").reset()
      loadAdminDashboard()
    }
  } catch (error) {
    console.error("Erreur création admin:", error)
  }
}

async function createBackup() {
  const confirmed = await AdminUtils.confirmAction(
    "Êtes-vous sûr de vouloir créer une sauvegarde système ? Cette opération peut prendre quelques minutes.",
    "Sauvegarde Système",
  )

  if (!confirmed) return

  try {
    AdminUtils.showNotification("Création de la sauvegarde en cours...", "info")

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/system-backup.php`, {
      method: "POST",
    })

    if (data && data.success) {
      AdminUtils.showNotification("Sauvegarde créée avec succès", "success")
    }
  } catch (error) {
    console.error("Erreur sauvegarde:", error)
  }
}

async function dismissAlert(alertId) {
  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/alerts.php`, {
      method: "DELETE",
      body: JSON.stringify({ id: alertId }),
    })

    if (data && data.success) {
      loadAdminDashboard()
    }
  } catch (error) {
    console.error("Erreur suppression alerte:", error)
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Export des fonctions globales
window.loadAdminDashboard = loadAdminDashboard
window.openCreateAdminModal = openCreateAdminModal
window.createAdmin = createAdmin
window.createBackup = createBackup
window.dismissAlert = dismissAlert
