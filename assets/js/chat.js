function initChat() {
    let currentUser = null;
    let selectedUser = null;
    
    // Éléments DOM
    const currentUserImg = document.querySelector('.current-user-img');
    const currentUserName = document.querySelector('.current-user-name');
    const usersListContainer = document.querySelector('.users-list-container');
    const chatArea = document.querySelector('.chat-area');
    const usersList = document.querySelector('.users-list');
    const chatBox = document.querySelector('.chat-box');
    const chatUserImg = document.querySelector('.chat-user-img');
    const chatUserName = document.querySelector('.chat-user-name');
    const typingArea = document.querySelector('.typing-area');
    const incomingIdInput = document.querySelector('.incoming_id');
    const messageInput = document.querySelector('.input-field');
    const searchInput = document.querySelector('.search input');
    const searchBtn = document.querySelector('.search button');
    const backToUsersBtn = document.querySelector('.back-to-users');
    
    // Charger l'utilisateur connecté
    loadCurrentUser();
    
    // Charger la liste des utilisateurs
    loadUsers();
    
    // Événements
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', handleSearch);
    backToUsersBtn.addEventListener('click', showUsersList);
    typingArea.addEventListener('submit', handleSendMessage);
    
    // Fonctions
    function loadCurrentUser() {
        fetch('/api/chat/get_current_user.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    currentUserImg.src = `/uploads/${currentUser.profile_picture}`;
                    currentUserName.textContent = `${currentUser.nom} ${currentUser.prenom}`;
                } else {
                    console.error('Erreur lors du chargement de l\'utilisateur:', data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }
    
    function loadUsers() {
        fetch('/api/chat/get_users.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayUsers(data.users);
                } else {
                    console.error('Erreur lors du chargement des utilisateurs:', data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }
    
    function displayUsers(users) {
        usersListContainer.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user';
            userElement.innerHTML = `
                <img src="/uploads/${user.profile_picture}" alt="">
                <div class="details">
                    <span>${user.nom} ${user.prenom}</span>
                    <p>@${user.pseudo}</p>
                </div>
            `;
            
            userElement.addEventListener('click', () => selectUser(user));
            usersListContainer.appendChild(userElement);
        });
    }
    
    function selectUser(user) {
        selectedUser = user;
        chatUserImg.src = `/uploads/${user.profile_picture}`;
        chatUserName.textContent = `${user.nom} ${user.prenom}`;
        incomingIdInput.value = user.id;
        
        showChatArea();
        loadMessages();
    }
    
    function showChatArea() {
        usersList.style.display = 'none';
        chatArea.style.display = 'flex';
    }
    
    function showUsersList() {
        usersList.style.display = 'block';
        chatArea.style.display = 'none';
        selectedUser = null;
    }
    
    function loadMessages() {
        if (!selectedUser) return;
        
        fetch(`/api/chat/get_chat.php?outgoing_id=${currentUser.id}&incoming_id=${selectedUser.id}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayMessages(data.messages);
                } else {
                    console.error('Erreur lors du chargement des messages:', data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }
    
    function displayMessages(messages) {
        chatBox.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            const isOutgoing = message.outgoing_msg_id == currentUser.id;
            
            messageElement.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
            messageElement.innerHTML = `
                <div class="details">
                    ${message.msg}
                </div>
            `;
            
            chatBox.appendChild(messageElement);
        });
        
        // Scroll vers le bas
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function handleSendMessage(e) {
        e.preventDefault();
        
        if (!selectedUser || !messageInput.value.trim()) return;
        
        const message = messageInput.value.trim();
        
        fetch('/api/chat/insert_chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                incoming_id: selectedUser.id,
                message: message
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageInput.value = '';
                loadMessages(); // Recharger les messages
            } else {
                console.error('Erreur lors de l\'envoi du message:', data.message);
            }
        })
        .catch(error => console.error('Erreur:', error));
    }
    
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const users = document.querySelectorAll('.users-list-container .user');
        
        users.forEach(user => {
            const userName = user.querySelector('.details span').textContent.toLowerCase();
            const userPseudo = user.querySelector('.details p').textContent.toLowerCase();
            
            if (userName.includes(searchTerm) || userPseudo.includes(searchTerm)) {
                user.style.display = 'flex';
            } else {
                user.style.display = 'none';
            }
        });
    }
    
    // Actualiser les messages toutes les 3 secondes si une conversation est ouverte
    setInterval(() => {
        if (selectedUser) {
            loadMessages();
        }
    }, 3000);
}

initChat(); 