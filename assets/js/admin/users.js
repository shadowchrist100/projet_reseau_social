let currentPage = 1
let totalPages = 1
const usersPerPage = 20
const currentFilters = {}
const selectedUsers = new Set()
const AdminUtils = window.AdminUtils // Declare AdminUtils
const API_BASE_URL = window.API_BASE_URL // Declare API_BASE_URL

document.addEventListener("DOMContentLoaded", () => {
  initializeUsersPage()
  loadUsers()

  // Event listeners pour les filtres
  document.getElementById("searchUsers").addEventListener("input", AdminUtils.debounce(handleSearch, 500))

  document.getElementById("statusFilter").addEventListener("change", handleFilterChange)
  document.getElementById("verifiedFilter").addEventListener("change", handleFilterChange)
  document.getElementById("dateFilter").addEventListener("change", handleFilterChange)

  // Event listener pour la sélection globale
  document.getElementById("selectAll").addEventListener("change", handleSelectAll)
})

function initializeUsersPage() {
  // Initialisation des événements et de l'interface
  setupTableEvents()
}

function setupTableEvents() {
  // Event delegation pour les actions dans le tableau
  document.getElementById("usersTableBody").addEventListener("click", (e) => {
    const target = e.target.closest("button")
    if (!target) return

    const userId = target.dataset.userId
    const action = target.dataset.action

    switch (action) {
      case "view":
        viewUser(userId)
        break
      case "edit":
        editUser(userId)
        break
      case "toggle-status":
        toggleUserStatus(userId)
        break
      case "delete":
        deleteUser(userId)
        break
    }
  })

  // Event delegation pour les checkboxes
  document.getElementById("usersTableBody").addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
      handleUserSelection(e.target)
    }
  })
}

async function loadUsers() {
  try {
    AdminUtils.showLoading("usersTableBody")

    const params = new URLSearchParams({
      page: currentPage,
      limit: usersPerPage,
      ...currentFilters,
    })

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php?${params}`)

    if (data && data.success) {
      displayUsers(data.users)
      updatePagination(data.pagination)
      updateSelectedCount()
    }
  } catch (error) {
    console.error("Erreur chargement utilisateurs:", error)
    AdminUtils.showNotification("Erreur lors du chargement des utilisateurs", "error")
  } finally {
    AdminUtils.hideLoading("usersTableBody")
  }
}

function displayUsers(users) {
  const tbody = document.getElementById("usersTableBody")

  if (!users || users.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center" style="padding: 40px; color: #666;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                    <br>Aucun utilisateur trouvé
                </td>
            </tr>
        `
    return
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}" 
                       ${selectedUsers.has(user.id.toString()) ? "checked" : ""}>
            </td>
            <td>
                <img src="${user.avatar || "/placeholder.svg?height=40&width=40"}" 
                     alt="Avatar" class="avatar" 
                     onerror="this.src='/placeholder.svg?height=40&width=40'">
            </td>
            <td>
                <strong>${escapeHtml(user.username)}</strong>
            </td>
            <td>
                ${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}
            </td>
            <td>
                ${escapeHtml(user.email)}
            </td>
            <td>
                <span class="status-badge ${user.is_active ? "active" : "inactive"}">
                    ${user.is_active ? "Actif" : "Inactif"}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.is_verified ? "verified" : "unverified"}">
                    ${user.is_verified ? "Vérifié" : "Non vérifié"}
                </span>
            </td>
            <td>
                ${user.last_login ? AdminUtils.formatDate(user.last_login) : "Jamais"}
            </td>
            <td>
                ${AdminUtils.formatDate(user.created_at)}
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-icon btn-primary" data-user-id="${user.id}" 
                            data-action="view" title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-icon btn-warning" data-user-id="${user.id}" 
                            data-action="edit" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-icon ${user.is_active ? "btn-warning" : "btn-success"}" 
                            data-user-id="${user.id}" data-action="toggle-status" 
                            title="${user.is_active ? "Désactiver" : "Activer"}">
                        <i class="fas fa-${user.is_active ? "ban" : "check"}"></i>
                    </button>
                    <button class="btn btn-icon btn-danger" data-user-id="${user.id}" 
                            data-action="delete" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function updatePagination(pagination) {
  totalPages = pagination.total_pages
  currentPage = pagination.current_page

  // Mise à jour des informations de pagination
  const start = (currentPage - 1) * usersPerPage + 1
  const end = Math.min(currentPage * usersPerPage, pagination.total)

  document.getElementById("paginationInfo").textContent =
    `Affichage de ${start} à ${end} sur ${pagination.total} utilisateurs`

  // Mise à jour des boutons de navigation
  document.getElementById("prevPage").disabled = currentPage <= 1
  document.getElementById("nextPage").disabled = currentPage >= totalPages

  // Génération des numéros de page
  generatePageNumbers()
}

function generatePageNumbers() {
  const container = document.getElementById("pageNumbers")
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  let html = ""

  for (let i = start; i <= end; i++) {
    html += `
            <a href="#" class="page-number ${i === currentPage ? "active" : ""}" 
               onclick="goToPage(${i}); return false;">
                ${i}
            </a>
        `
  }

  container.innerHTML = html
}

function changePage(direction) {
  const newPage = currentPage + direction
  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage
    loadUsers()
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    currentPage = page
    loadUsers()
  }
}

function handleSearch(e) {
  currentFilters.search = e.target.value.trim()
  currentPage = 1
  loadUsers()
}

function handleFilterChange(e) {
  const filterName = e.target.id.replace("Filter", "")
  const value = e.target.value

  if (value) {
    currentFilters[filterName] = value
  } else {
    delete currentFilters[filterName]
  }

  currentPage = 1
  loadUsers()
}

function handleSelectAll(e) {
  const checkboxes = document.querySelectorAll(".user-checkbox")
  const isChecked = e.target.checked

  checkboxes.forEach((checkbox) => {
    checkbox.checked = isChecked
    if (isChecked) {
      selectedUsers.add(checkbox.value)
    } else {
      selectedUsers.delete(checkbox.value)
    }
  })

  updateSelectedCount()
}

function handleUserSelection(checkbox) {
  if (checkbox.checked) {
    selectedUsers.add(checkbox.value)
  } else {
    selectedUsers.delete(checkbox.value)
  }

  updateSelectedCount()

  // Mise à jour du checkbox "Tout sélectionner"
  const selectAllCheckbox = document.getElementById("selectAll")
  const allCheckboxes = document.querySelectorAll(".user-checkbox")
  const checkedCheckboxes = document.querySelectorAll(".user-checkbox:checked")

  selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length
  selectAllCheckbox.checked = checkedCheckboxes.length === allCheckboxes.length && allCheckboxes.length > 0
}

function updateSelectedCount() {
  const count = selectedUsers.size
  const bulkActions = document.getElementById("bulkActions")
  const selectedCount = document.getElementById("selectedCount")

  if (count > 0) {
    bulkActions.style.display = "flex"
    selectedCount.textContent = `${count} utilisateur(s) sélectionné(s)`
  } else {
    bulkActions.style.display = "none"
  }
}

async function viewUser(userId) {
  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php?id=${userId}`)

    if (data && data.success) {
      showUserModal(data.user, "view")
    }
  } catch (error) {
    console.error("Erreur chargement utilisateur:", error)
  }
}

async function editUser(userId) {
  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php?id=${userId}`)

    if (data && data.success) {
      showUserModal(data.user, "edit")
    }
  } catch (error) {
    console.error("Erreur chargement utilisateur:", error)
  }
}

function showUserModal(user, mode = "view") {
  const modal = document.getElementById("userModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalBody = document.getElementById("modalBody")
  const saveBtn = document.getElementById("saveUserBtn")

  modalTitle.textContent = mode === "edit" ? "Modifier l'utilisateur" : "Détails de l'utilisateur"
  saveBtn.style.display = mode === "edit" ? "block" : "none"

  const readonly = mode === "view" ? "readonly" : ""
  const disabled = mode === "view" ? "disabled" : ""

  modalBody.innerHTML = `
        <form class="modal-form" id="userForm">
            <input type="hidden" id="userId" value="${user.id}">
            
            <div class="form-group">
                <label for="userUsername">Nom d'utilisateur</label>
                <input type="text" id="userUsername" value="${escapeHtml(user.username)}" ${readonly}>
            </div>
            
            <div class="form-group">
                <label for="userEmail">Email</label>
                <input type="email" id="userEmail" value="${escapeHtml(user.email)}" ${readonly}>
            </div>
            
            <div class="form-group">
                <label for="userFirstName">Prénom</label>
                <input type="text" id="userFirstName" value="${escapeHtml(user.first_name)}" ${readonly}>
            </div>
            
            <div class="form-group">
                <label for="userLastName">Nom</label>
                <input type="text" id="userLastName" value="${escapeHtml(user.last_name)}" ${readonly}>
            </div>
            
            <div class="form-group">
                <label for="userBio">Biographie</label>
                <textarea id="userBio" ${readonly}>${escapeHtml(user.bio || "")}</textarea>
            </div>
            
            <div class="form-group">
                <label for="userStatus">Statut</label>
                <select id="userStatus" ${disabled}>
                    <option value="1" ${user.is_active ? "selected" : ""}>Actif</option>
                    <option value="0" ${!user.is_active ? "selected" : ""}>Inactif</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="userVerified">Vérification</label>
                <select id="userVerified" ${disabled}>
                    <option value="1" ${user.is_verified ? "selected" : ""}>Vérifié</option>
                    <option value="0" ${!user.is_verified ? "selected" : ""}>Non vérifié</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Date d'inscription</label>
                <input type="text" value="${AdminUtils.formatDate(user.created_at)}" readonly>
            </div>
            
            <div class="form-group">
                <label>Dernière connexion</label>
                <input type="text" value="${user.last_login ? AdminUtils.formatDate(user.last_login) : "Jamais"}" readonly>
            </div>
        </form>
    `

  AdminUtils.openModal("userModal")
}

async function saveUser() {
  const form = document.getElementById("userForm")
  const formData = new FormData(form)

  const userData = {
    id: document.getElementById("userId").value,
    username: document.getElementById("userUsername").value.trim(),
    email: document.getElementById("userEmail").value.trim(),
    first_name: document.getElementById("userFirstName").value.trim(),
    last_name: document.getElementById("userLastName").value.trim(),
    bio: document.getElementById("userBio").value.trim(),
    is_active: document.getElementById("userStatus").value,
    is_verified: document.getElementById("userVerified").value,
  }

  // Validation
  if (!userData.username || !userData.email || !userData.first_name || !userData.last_name) {
    AdminUtils.showNotification("Veuillez remplir tous les champs obligatoires", "error")
    return
  }

  if (!AdminUtils.validateEmail(userData.email)) {
    AdminUtils.showNotification("Email invalide", "error")
    return
  }

  try {
    AdminUtils.showLoading("saveUserBtn")

    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })

    if (data && data.success) {
      AdminUtils.showNotification("Utilisateur modifié avec succès", "success")
      AdminUtils.closeModal()
      loadUsers()
    }
  } catch (error) {
    console.error("Erreur sauvegarde utilisateur:", error)
  } finally {
    AdminUtils.hideLoading("saveUserBtn")
  }
}

async function toggleUserStatus(userId) {
  const confirmed = await AdminUtils.confirmAction(
    "Êtes-vous sûr de vouloir changer le statut de cet utilisateur ?",
    "Changement de statut",
  )

  if (!confirmed) return

  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php`, {
      method: "PATCH",
      body: JSON.stringify({
        id: userId,
        action: "toggle_status",
      }),
    })

    if (data && data.success) {
      AdminUtils.showNotification("Statut modifié avec succès", "success")
      loadUsers()
    }
  } catch (error) {
    console.error("Erreur changement statut:", error)
  }
}

async function deleteUser(userId) {
  const confirmed = await AdminUtils.confirmAction(
    "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
    "Suppression d'utilisateur",
  )

  if (!confirmed) return

  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php`, {
      method: "DELETE",
      body: JSON.stringify({ id: userId }),
    })

    if (data && data.success) {
      AdminUtils.showNotification("Utilisateur supprimé avec succès", "success")
      selectedUsers.delete(userId.toString())
      loadUsers()
    }
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error)
  }
}

async function bulkAction(action) {
  if (selectedUsers.size === 0) {
    AdminUtils.showNotification("Aucun utilisateur sélectionné", "warning")
    return
  }

  const actionLabels = {
    activate: "activer",
    deactivate: "désactiver",
    delete: "supprimer",
  }

  const confirmed = await AdminUtils.confirmAction(
    `Êtes-vous sûr de vouloir ${actionLabels[action]} ${selectedUsers.size} utilisateur(s) ?`,
    `${actionLabels[action].charAt(0).toUpperCase() + actionLabels[action].slice(1)} en lot`,
  )

  if (!confirmed) return

  try {
    const data = await AdminUtils.makeRequest(`${API_BASE_URL}/users.php`, {
      method: "POST",
      body: JSON.stringify({
        action: "bulk_" + action,
        user_ids: Array.from(selectedUsers),
      }),
    })

    if (data && data.success) {
      AdminUtils.showNotification(`Action "${actionLabels[action]}" effectuée avec succès`, "success")
      selectedUsers.clear()
      loadUsers()
    }
  } catch (error) {
    console.error("Erreur action en lot:", error)
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Export des fonctions globales
window.loadUsers = loadUsers
window.changePage = changePage
window.goToPage = goToPage
window.saveUser = saveUser
window.bulkAction = bulkAction
