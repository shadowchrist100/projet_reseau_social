function home() 
{
    let has_liked="";
    // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
    const create_post=document.getElementById("create_post");
    const post=document.querySelector(".create-post");
    const postImageInput = document.getElementById("post_image");
    const imagePreview = document.getElementById("image_preview");
    const messages=document.getElementById("messages-notifications");
    const logout=document.getElementById("logout");
    
    //récupérer les infos de l'utilisateur connecté 
    fetch("/api/user.php")
    .then(response=>response.json())
    .then(data=>{
        // enregistrer les données de l'utilisateur afin qu'il soit accessible partout
        window.user_data=data;
        
        // afficher la photo de profil de l'utilisateur connecté
        user_profil.forEach(element => {
        element.src="/uploads/"+window.user_data.profile;
        });
        
        // afficher le pseudo de l'utilisateur connecté
        user_pseudo.forEach(element=>{
            element.textContent="@"+window.user_data.pseudo;
        });
        
        // afficher le nom de l'utilisateur connecté
        user_name.forEach(element=>{
            element.textContent=window.user_data.name+" "+window.user_data.prenom;
        })
        document.getElementById("post_text").placeholder=`Quoi de neuf,${window.user_data.name} ? `;

        // récupérer les requêtes d'amis
        fetch(`api/get_friends_requests.php?user_id=${window.user_data.id}`)
        .then(response=>response.json())
        .then(data=>{
            if (data.success) 
            {
                const requests=data.friends_requests;   
                console.log(requests);
                requests.forEach(request=>{
                    show_friend_requests(request)
                })
            }
        })
    })
    .catch(error=>console.error(error))
    
    /*******Gestions des posts et création des posts  **************/
    // envoyer les informations du post au backend pour l'enregistrement
        // afficher l'image sélectionnée dans le champ de saisie d'image
    postImageInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = "";
            imagePreview.style.display = "none";
        }
    });
    create_post.addEventListener("click", function () {

            // stockage des infos du post dans post_data
        const post_data=new FormData(post);
        fetch("/api/create_post.php",{
            method:"POST",
            body:post_data,
        })
        .then(response=>response.json())
        .then(data=>{
            if (data.success) 
            {
                document.getElementById("post_text").value = "";
                postImageInput.value = "";
                imagePreview.src = "";
                imagePreview.style.display = "none";
                
                // afficher le post dans le fil d'actualité
                print_posts(data.post,true);
            }
            else
            {
                console.log(data.error)
            }
        })
        .catch(error=>console.error(error)
        )
    })

    // charger les posts de l'utilisateur  
        // afficher les posts dans le fil d'actualité
    function print_posts(post,is_first) 
    {
        const like_color= post.liked_by_user? "red": "black";

        const comment={
            "content":post.comment_content,
            "created_at":post.comment_created_at,
            "nom":post.comment_nom,
            "prenom":post.comment_prenom,
            "profile_picture":post.comment_profile
        };
        const show_recent_comment = (comment && comment.content) ? "block" : "none";
        const feed=document.createElement("div");
        feed.className="feed";
        feed.innerHTML=`
        <div class="head">
            <button class="user_post_id user" post_id=${post.id} type="button">
                <div class="user" data-user-id="${post.user_id}">
                    <div class="profile-photo">
                        <img class="profil" src="/uploads/${post.profile_picture}" alt="">
                    </div>
                    <div class="info">
                        <h3 class="post_user_name">${post.nom} ${post.prenom}</h3>
                        <small>${post.created_at}</small>
                    </div>
                </div>
            </button>  
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        <div class="content">
            <p>
                ${post.content}
            </p>
        </div>
        <div class="photo">
            <img src="/uploads/posts/${post.image_path}" alt="">
        </div>
        <div class="action-button">
            <div class="interaction-buttons">
                <button class="like-button uil uil-heart-sign" type="button" data-post-id=${post.id} style="color:${like_color} "></button>
                <button type="button" class="comment-button uil uil-comment-dots" data-post-id=${post.id}></button>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="comment-form-container" data-post-id="${post.id}" style="display: none;">
            <textarea class="comment-text" data-post-id="${post.id}" placeholder="Écrire un commentaire..."></textarea>
            <button type="button" class="send-comment-btn" data-post-id="${post.id}">Publier</button>
        </div>
        <div class="liked-by" id=${post.id} >
            
        </div>
        <div class="caption">
            <p>
                ${post.nom} ${post.prenom} <span></span>
            </p>
        </div>
        <div class="comments-container " data-post-id="${post.id}" style="display: none;">
            
        </div>
        <button type="button" class=" comments text-muted">view all  comments </button>
        
        `
        is_first===true? document.querySelector(".feeds").insertBefore(feed,document.querySelector(".feeds").firstChild):document.querySelector(".feeds").appendChild(feed);
        get_users_likes(post.id);

    }
    // récupérer les posts depuis le backend et afficher dans le fil d'actualité
    function load_posts() {
        fetch("/api/get_posts.php")
        .then(response=>response.json())
        .then(data=>{
            data.forEach(post=>{
                // afficher les posts de l'utilisateur
                print_posts(post,false);
            });
        })
        .catch(error=>console.error(error));
    }
    load_posts();  


    // afficher les messages
    messages.addEventListener("click", function () {
        load_view("chat");
    });

    // gérer la déconnexion de l'utilisateur
    // ajouter un écouteur d'évènement sur le bouton de déconnexion
    logout.addEventListener("click", function () {
        fetch("api/logout.php")
        .then(response=>response.json())
        .then(data=>{
            if (data.success) 
            {
                load_view("login"); 
            }
            else
            {
                console.error("Erreur lors de la déconnexion");
            }
        })
        .catch(error=>console.error(error));
    });

    /*************** likes et commentaires**************** */

        // récupération des utilisateurs ayant liké un post
    function get_users_likes(post_id)
    {
        fetch(`api/get_users_likes.php?post_id=${post_id}`)
        .then(response=>response.json())
        .then(data=>{
            // récupération de la balise contenant les personnes ayant liké le post
            const liked_by=document.getElementById(post_id);
            if (data.success && liked_by && Array.isArray(data.likes)) 
            {
                
                // on récupére ceux qui ont liké  sauf l'utilisateur actuel
                const likes_sans_user= data.likes.filter(user => user.user_id !== window.user_data.id);    
                
                // on vérifie si l'utilisateur a déja liké une fois 
                has_liked = data.likes.some(user => user.user_id === window.user_data.id);

                // on récupére chaque élément du tableau likes sous forme d'objer user dont on affiche la photo de profil
                liked_by.innerHTML=data.likes.filter(user => user.user_id !== window.user_data.id).map(user => `<span><img src="/uploads/${user.profile_picture}" title="${user.nom} ${user.prenom}" alt=""></span>`).join("");
            
                const text = document.createElement("p"); //va contenir le nom de ceux ayant liké
                
                const likes = data.likes;
                // en fonction du nombre de personnes ayant liké on affiche un message

                if (has_liked && likes_sans_user.length === 0) 
                {
                    text.innerHTML = `Liked by <b>you</b>`;
                } 
                else if (has_liked && likes_sans_user.length === 1) 
                {
                    const other = likes_sans_user[0];
                    text.innerHTML = `Liked by <b>you</b> and <b>${other.nom} ${other.prenom}</b>`;
                } 
                else if (has_liked && likes_sans_user.length > 1) 
                {
                    text.innerHTML = `Liked by <b>you</b> and <b>${likes_sans_user.length} others</b>`;
                } 
                else if (!has_liked && likes_sans_user.length === 1) 
                {
                    const other = likes_sans_user[0];
                    text.innerHTML = `Liked by <b>${other.nom} ${other.prenom}</b>`;
                } 
                else if (!has_liked && likes_sans_user.length > 1) 
                {
                    text.innerHTML = `Liked by <b>${likes_sans_user[0].nom} ${likes_sans_user[0].prenom}</b> and <b>${likes_sans_user.length - 1} others</b>`;
                }

                liked_by.appendChild(text);
            }
            else
            {
                console.log("Echec de récupération")
            }
        })
        .catch(error=>console.error(error)
        );
    } 

        // afficher les commentaires d'un post
    function print_comments(comment,post_id) 
    {   
        
        {
            const div_comment=document.createElement("div");
            div_comment.className="comment"
            div_comment.innerHTML=`
                <img  src="/uploads/${comment.profile_picture}" alt="profile">
                <div class="comment-content">
                    <strong>${comment.nom} ${comment.prenom}</strong>
                    <p>${comment.content}</p>
                    <small>${comment.created_at}</small>
                </div>
            `
            // ajout du commentaire dans la div des commentaires du post concerné
            document.querySelector(`.comments-container[data-post-id="${post_id}"]`).appendChild(div_comment);
            document.querySelector(`.comments-container[data-post-id="${post_id}"]`).style.display="block";
        }
    }
    document.querySelector(".feeds").addEventListener("click", function (event) {
        // récupération de l'élément sélectionné
        const target = event.target;

        // récupérer 
        // vérifier si l'élément cliqué est un bouton de like
        if (event.target.classList.contains("like-button")) 
        {
            // récupération de l'id du post
            const post_id = event.target.dataset.postId;
            
            // si l'utilisateur avait déja liké
            if (has_liked) 
            {
                // mis à jour l'interface utilisateur 
                const like_btn=document.querySelector(`.uil-heart-sign[data-post-id="${post_id}"]`);
                like_btn.style.color="black";
                has_liked=false;
            }
            // si l'utilisateur veut liker pour la première fois
            else
            {
                // envoyer une requête pour liker le post
                const form_data = new FormData();
                
                form_data.append("post_id", post_id);
                fetch("api/like_post.php", {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: form_data
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Post liked successfully");
                        
                        // mis à jour l'interface utilisateur 
                        const like_btn=document.querySelector(`.uil-heart-sign[data-post-id="${post_id}"]`);
                        like_btn.style.color="red";
                        has_liked=true;
                        
                    } else {
                        console.error("Error liking post:", data.error);
                    }
                })
                .catch(error => console.error("Error:", error));
            }
            
        }
        // si l'utilisateur clic sur le bouton du commentaire
        else if(event.target.classList.contains("comment-button"))
        {
            // récupération de l'id du post
            const post_id=event.target.dataset.postId;

            // récupérer le champ commentaire du post sélectionner
            const form_container=document.querySelector(`.comment-form-container[data-post-id="${post_id}"]`);
            
            // afficher le champ de saisie du formulaire ou le fermer si il était déja là
            form_container.style.display=(form_container.style.display==="none")? "block":"none";
    
        }
        // si l'utilisateur click sur  publier
        else if(event.target.classList.contains("send-comment-btn"))
        {
            // récupération de l'id du post
            const post_id=event.target.dataset.postId;

            // récupération du commentaire
            const comment_content=document.querySelector(`.comment-text[data-post-id="${post_id}"]`).value;
            document.querySelector(`.comment-text[data-post-id="${post_id}"]`).value="";
            
            // fermetture du champ
            document.querySelector(`.comment-form-container[data-post-id="${post_id}"]`).style.display="none";

            /*********envoi des données du commentaire au backend*******/
            const form_data=new FormData();
            form_data.append("post_id",post_id);
            form_data.append("comment",comment_content);
            console.log(comment_content);
            fetch("api/create_comment.php",{
                method:"POST",
                headers:{
                    Accept:"application/json"
                },
                body:form_data
            })
            .then(response=>response.json())
            .then(data=>{
                if (data.success) 
                {
                    console.log("commentaire bien ajoutée");
                        
                }
                else
                {
                    console.log(data.error);
                    
                }
            })
            .catch(error=>console.error(error));
        }
        // si l'utilisateur souhaite afficher tous les commentaires
        else if (event.target.classList.contains("comments")) {
            
            // récupérer le container des commentaires
            const comments=(event.target).previousElementSibling;
            // récupérer l'id du post
            const post_id=comments.dataset.postId;
            
            // requête pour récupérer les commentaires du post concerné
            fetch(`api/get_comments.php?post_id=${post_id}`)
            .then(response=>response.json())
            .then(data=>{
                if (data.success) 
                {
                    data.comments.forEach((comment) => {
                        print_comments(comment,post_id);
                    });
                }
            })
            
        }
        // afficher le profil d'un utilisateur depuis un de ses posts
        else if (event.target.closest(".user")) {
            // enregistrement de l'id de l'utilisateur ayant fais le post
            const user_id = event.target.closest(".user").dataset.userId;
            localStorage.setItem("view_user_id", user_id);

            // enregistrer les infos de l'utilisateur connecté
            localStorage.setItem("user_data",JSON.stringify(window.user_data));

            // charger la vue du profil de l'utilisateur
            load_view("profil");
        }
    });

    function show_friend_requests(request)
    {
        const div_request=document.createElement("div");
        div_request.className="request";
        div_request.innerHTML=`
             <div class="info">
                        <div class="profile-photo">
                            <img src="/uploads/${request.profile_picture}" alt="">
                        </div>
                        <div>
                            <h5>${request.nom} ${request.prenom}</h5>
                            <p class="text-muted">
                                8 mutual friends
                            </p>
                        </div>
                    </div>
                    <div class="action">
                        <button class="accept-btn btn btn-primary" data-id=${request.id} >Accept</button>
                        <button class="decline-btn btn" data-id=${request.id} >Decline</button>
                    </div>
        `
        document.querySelector(".friend-request").appendChild(div_request);
    }

    document.querySelector(".friend-request").addEventListener("click", function(event){
        // récupérer l'élément sélectionné
        const target=event.target;
        
        if (target.classList.contains("accept-btn")) 
        {
            fetch(`api/friend_request_answer.php?user_id=${event.target.dataset.id}&ans=TRUE`)
            .then(response=> response.json())
            .then(data=>{
                event.target.textContent="Ajouté"
                document.querySelector(`.decline-btn[data-id="${event.target.dataset.id}"]`).remove()
            })
            .catch(error=>console.error(error)
            );
        }
        else if(target.classList.contains("decline-btn"))
        {
            fetch(`api/friend_request_answer.php?user_id="${event.target.dataset.id}"&&ans="FALSE"`)
            .then(response=> response.json())
            .then(data=>{
                 document.querySelector(`.accepted-btn[data-id="${event.target.dataset.id}"]`).remove()
                event.target.textContent="Rejetée"
            })
            .catch(error=>console.error(error)
            );
        }
    })
}
home();