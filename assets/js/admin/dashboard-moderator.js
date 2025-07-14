import { Chart } from "@/components/ui/chart"
let moderationChart = null
const AdminUtils = window.AdminUtils
const API_BASE_URL = "../../api/admin"

document.addEventListener("DOMContentLoaded", () => {
  // Vérifier que l'utilisateur est bien un modérateur
  const user = AdminUtils.getUser()
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    AdminUtils.showNotification("Accès non autorisé", "error")
    window.location.href = "login.html"
    return
  }

  loadModeratorDashboard()

  // Actualisation automatique toutes les 2 minutes pour les signalements
  setInterval(loadModeratorDashboard, 2 * 60 * 1000)
})

async function loadModeratorDashboard() {
  try {
    AdminUtils.showLoading("content-body")

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/dashboard-moderator.php`)

    if (data && data.success) {
      updateModerationStats(data.stats)
      updateQuickActionsCounts(data.quick_actions)
      updateRecentReports(data.recent_reports)
      updateArticlesToModerate(data.articles_to_moderate)
      updateModerationChart(data.moderation_activity)
      updateMyRecentActions(data.my_actions)
    }
  } catch (error) {
    console.error("Erreur chargement dashboard modérateur:", error)
    AdminUtils.showNotification("Erreur lors du chargement du dashboard", "error")
  } finally {
    AdminUtils.hideLoading("content-body")
  }
}

function updateModerationStats(stats) {
  document.getElementById("totalReports").textContent = stats.total_reports || 0
  document.getElementById("moderatedArticles").textContent = stats.moderated_articles || 0
  document.getElementById("suspendedUsers").textContent = stats.suspended_users || 0
  document.getElementById("resolvedReports").textContent = stats.resolved_reports || 0

  document.getElementById("pendingReportsCount").textContent = `${stats.pending_reports || 0} en attente`
  document.getElementById("articlesThisWeek").textContent = `+${stats.articles_this_week || 0} cette semaine`
  document.getElementById("suspensionsToday").textContent = `${stats.suspensions_today || 0} aujourd'hui`

  // Mise à jour du header
  document.getElementById("pendingReports").textContent = stats.pending_reports || 0

  // Animation des compteurs
  animateCounters()
}

function updateQuickActionsCounts(counts) {
  document.getElementById("urgentReportsCount").textContent = counts.urgent_reports || 0
  document.getElementById("reportedArticlesCount").textContent = counts.reported_articles || 0
  document.getElementById("suspiciousUsersCount").textContent = counts.suspicious_users || 0

  // Ajouter des classes d'urgence si nécessaire
  const urgentCard = document.querySelector(".quick-action-card.urgent")
  if (counts.urgent_reports > 0) {
    urgentCard.classList.add("has-urgent")
  } else {
    urgentCard.classList.remove("has-urgent")
  }
}

function updateRecentReports(reports) {
  const container = document.getElementById("recentReports")

  if (!reports || reports.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun signalement récent</p>'
    return
  }

  container.innerHTML = reports
    .map(
      (report) => `
        <div class="activity-item report-item ${report.priority === "high" ? "urgent" : ""}">
            <div class="activity-avatar ${getReportTypeClass(report.type)}">
                <i class="fas fa-${getReportIcon(report.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(report.reason)}</div>
                <div class="activity-meta">
                    ${escapeHtml(report.reported_content)} • 
                    Signalé par ${escapeHtml(report.reporter_name)} • 
                    ${AdminUtils.timeAgo(report.created_at)}
                    ${report.priority === "high" ? '<span class="priority-badge high">URGENT</span>' : ""}
                </div>
            </div>
            <div class="activity-actions">
                <button class="btn btn-sm btn-primary" onclick="handleReport(${report.id})">
                    Traiter
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateArticlesToModerate(articles) {
  const container = document.getElementById("articlesToModerate")

  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucun article à modérer</p>'
    return
  }

  container.innerHTML = articles
    .map(
      (article) => `
        <div class="activity-item article-item">
            <div class="activity-avatar">
                ${article.author_first_name.charAt(0)}${article.author_last_name.charAt(0)}
            </div>
            <div class="activity-content">
                <div class="activity-title">${escapeHtml(article.title)}</div>
                <div class="activity-meta">
                    Par ${escapeHtml(article.author_first_name)} ${escapeHtml(article.author_last_name)} • 
                    ${AdminUtils.timeAgo(article.created_at)}
                    ${article.reports_count > 0 ? `<span class="reports-badge">${article.reports_count} signalement(s)</span>` : ""}
                </div>
            </div>
            <div class="activity-actions">
                <button class="btn btn-sm btn-info" onclick="viewArticle(${article.id})">
                    Voir
                </button>
                <button class="btn btn-sm btn-warning" onclick="moderateArticle(${article.id})">
                    Modérer
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateModerationChart(activityData) {
  const ctx = document.getElementById("moderationChart").getContext("2d")

  if (moderationChart) {
    moderationChart.destroy()
  }

  const labels = activityData.map((data) => data.date)
  const reportsData = activityData.map((data) => data.reports_handled)
  const articlesData = activityData.map((data) => data.articles_moderated)
  const usersData = activityData.map((data) => data.users_suspended)

  moderationChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Signalements traités",
          data: reportsData,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          tension: 0.4,
        },
        {
          label: "Articles modérés",
          data: articlesData,
          borderColor: "#f39c12",
          backgroundColor: "rgba(243, 156, 18, 0.1)",
          tension: 0.4,
        },
        {
          label: "Utilisateurs suspendus",
          data: usersData,
          borderColor: "#9b59b6",
          backgroundColor: "rgba(155, 89, 182, 0.1)",
          tension: 0.4,
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

function updateMyRecentActions(actions) {
  const container = document.getElementById("myRecentActions")

  if (!actions || actions.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">Aucune action récente</p>'
    return
  }

  container.innerHTML = actions
    .map(
      (action) => `
        <div class="timeline-item">
            <div class="timeline-marker ${getActionTypeClass(action.action)}">
                <i class="fas fa-${getActionIcon(action.action)}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${getActionLabel(action.action)}</div>
                <div class="timeline-description">${escapeHtml(action.details || "")}</div>
                <div class="timeline-time">${AdminUtils.timeAgo(action.created_at)}</div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Fonctions utilitaires
function getReportTypeClass(type) {
  const classes = {
    spam: "report-spam",
    inappropriate: "report-inappropriate",
    harassment: "report-harassment",
    fake: "report-fake",
    other: "report-other",
  }
  return classes[type] || "report-other"
}

function getReportIcon(type) {
  const icons = {
    spam: "exclamation-triangle",
    inappropriate: "ban",
    harassment: "user-slash",
    fake: "eye-slash",
    other: "flag",
  }
  return icons[type] || "flag"
}

function getActionTypeClass(action) {
  const classes = {
    HANDLE_REPORT: "success",
    MODERATE_ARTICLE: "warning",
    SUSPEND_USER: "danger",
    APPROVE_ARTICLE: "info",
  }
  return classes[action] || "secondary"
}

function getActionIcon(action) {
  const icons = {
    HANDLE_REPORT: "check",
    MODERATE_ARTICLE: "edit",
    SUSPEND_USER: "user-slash",
    APPROVE_ARTICLE: "thumbs-up",
  }
  return icons[action] || "cog"
}

function getActionLabel(action) {
  const labels = {
    HANDLE_REPORT: "Signalement traité",
    MODERATE_ARTICLE: "Article modéré",
    SUSPEND_USER: "Utilisateur suspendu",
    APPROVE_ARTICLE: "Article approuvé",
  }
  return labels[action] || action
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-content h3")

  counters.forEach((counter) => {
    const target = Number.parseInt(counter.textContent)
    const increment = target / 30
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        counter.textContent = target
        clearInterval(timer)
      } else {
        counter.textContent = Math.floor(current)
      }
    }, 50)
  })
}

// Actions de modération
async function handleReport(reportId) {
  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/reports.php?id=${reportId}`)
    if (data && data.success) {
      // Ouvrir modal de traitement du signalement
      window.showReportModal(data.report)
    }
  } catch (error) {
    console.error("Erreur chargement signalement:", error)
  }
}

async function moderateArticle(articleId) {
  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/articles.php?id=${articleId}`)
    if (data && data.success) {
      // Ouvrir modal de modération d'article
      window.showArticleModerationModal(data.article)
    }
  } catch (error) {
    console.error("Erreur chargement article:", error)
  }
}

function viewArticle(articleId) {
  window.open(`/article/${articleId}`, "_blank")
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Export des fonctions globales
window.loadModeratorDashboard = loadModeratorDashboard
window.handleReport = handleReport
window.moderateArticle = moderateArticle
window.viewArticle = viewArticle
