import { Chart } from "@/components/ui/chart"
let monthlyChart = null
const AdminUtils = window.AdminUtils
const API_BASE_URL = "../../api/admin"

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard()

  // Actualisation automatique toutes les 5 minutes
  setInterval(loadDashboard, 5 * 60 * 1000)
})

async function loadDashboard() {
  try {
    AdminUtils.showLoading("content-body")

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/dashboard.php`)

    if (data && data.success) {
      updateStats(data.stats)
      updateRecentArticles(data.recent_articles)
      updateRecentUsers(data.recent_users)
      updateChart(data.monthly_stats)
      updateAdminLogs(data.recent_logs)
    }
  } catch (error) {
    console.error("Erreur chargement dashboard:", error)
    AdminUtils.showNotification("Erreur lors du chargement du dashboard", "error")
  } finally {
    AdminUtils.hideLoading("content-body")
  }
}

function updateStats(stats) {
  // Mise à jour des statistiques principales
  document.getElementById("totalUsers").textContent = stats.total_users || 0
  document.getElementById("activeUsers").textContent = stats.active_users || 0
  document.getElementById("totalArticles").textContent = stats.total_articles || 0
  document.getElementById("totalAdmins").textContent = stats.total_admins || 0

  // Mise à jour des changements
  document.getElementById("newUsers").textContent = `+${stats.new_users || 0} cette semaine`
  document.getElementById("articlesToday").textContent = `+${stats.articles_today || 0} aujourd'hui`

  // Animation des compteurs
  animateCounters()
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-content h3")

  counters.forEach((counter) => {
    const target = Number.parseInt(counter.textContent)
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
    }, 20)
  })
}

function updateRecentArticles(articles) {
  const container = document.getElementById("recentArticles")

  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun article récent</p>'
    return
  }

  container.innerHTML = articles
    .map(
      (article) => `
        <div class="activity-item">
            <div class="activity-avatar">
                ${article.first_name.charAt(0)}${article.last_name.charAt(0)}
            </div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(article.title)}</div>
                <div class="activity-meta">
                    Par ${escapeHtml(article.first_name)} ${escapeHtml(article.last_name)} • 
                    ${AdminUtils.timeAgo(article.created_at)}
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateRecentUsers(users) {
  const container = document.getElementById("recentUsers")

  if (!users || users.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun nouvel utilisateur</p>'
    return
  }

  container.innerHTML = users
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
                    ${user.is_active ? '<span class="status-badge active">Actif</span>' : '<span class="status-badge inactive">Inactif</span>'}
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateChart(monthlyStats) {
  const ctx = document.getElementById("monthlyChart").getContext("2d")

  // Détruire le graphique existant s'il existe
  if (monthlyChart) {
    monthlyChart.destroy()
  }

  const labels = monthlyStats.map((stat) => stat.month)
  const usersData = monthlyStats.map((stat) => stat.users)
  const articlesData = monthlyStats.map((stat) => stat.articles)

  monthlyChart = new Chart(ctx, {
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
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  })
}

function updateAdminLogs(logs) {
  const container = document.getElementById("adminLogs")

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucune activité récente</p>'
    return
  }

  container.innerHTML = logs
    .map(
      (log) => `
        <div class="log-item">
            <div class="log-content">
                <div class="log-action">${getActionLabel(log.action)}</div>
                <div class="log-details">
                    Par ${escapeHtml(log.first_name)} ${escapeHtml(log.last_name)} 
                    ${log.details ? `• ${escapeHtml(log.details)}` : ""}
                </div>
            </div>
            <div class="log-time">${AdminUtils.timeAgo(log.created_at)}</div>
        </div>
    `,
    )
    .join("")
}

function getActionLabel(action) {
  const labels = {
    LOGIN: "Connexion",
    CREATE_ADMIN: "Création administrateur",
    UPDATE_ADMIN: "Modification administrateur",
    DELETE_ADMIN: "Suppression administrateur",
    CREATE_USER: "Création utilisateur",
    UPDATE_USER: "Modification utilisateur",
    DELETE_USER: "Suppression utilisateur",
    DELETE_ARTICLE: "Suppression article",
    UPDATE_ARTICLE: "Modification article",
  }

  return labels[action] || action
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Fonction pour actualiser manuellement
window.loadDashboard = loadDashboard
