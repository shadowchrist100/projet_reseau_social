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
        document.getElementById("post_text").placeholder=`What's on your mind, ${window.user_data.name}`;
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
        console.log(post.liked_by_user);
        
        const feed=document.createElement("div");
        feed.className="feed";
        feed.innerHTML=`
        <div class="head">
            <button class="user_post_id" post_id=${post.id} type="button">
                <div class="user">
                    <div class="profile-photo">
                        <img  src="/uploads/${post.profile_picture}" alt="">
                    </div>
                    <div class="info">
                        <h3>${post.nom} ${post.prenom}</h3>
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
                <button type="button" class="comment-btn uil uil-comment-dots" data-post-id=${post.id}></button>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by" id=${post.id} >
            
        </div>
        <div class="caption">
            <p>
                ${post.nom} ${post.prenom} <span></span>
            </p>
        </div>
        <div class=" comments text-muted">view all 277 comments </div>
        `
        is_first===true? document.querySelector(".feeds").insertBefore(feed,document.querySelector(".feeds").firstChild):document.querySelector(".feeds").appendChild(feed);
        get_users_likes(post.id);
        const user_post_id=document.querySelector(".user_post_id");

        // ajouter un écouteur d'évènement sur le profil de l'utilisateur du post
        user_post_id.addEventListener("click", function (event) {
           
            // récupérer l'id de l'utilisateur du post
            const post_id=event.target.id;
           
            // charger la vue du profil de l'utilisateur
            console.log(post_id);
            load_view("profil");
            
        });
    }
    // récupérer les posts depuis le backend et afficher dans le fil d'actualité
    function load_posts() {
        fetch("/api/get_posts.php")
        .then(response=>response.json())
        .then(data=>{
            const feed=document.getElementById("feed");
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
        load_view("messages");
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

    document.querySelector(".feeds").addEventListener("click", function (event) {
        
        // vérifier si l'élément cliqué est un bouton de like
        if (event.target.classList.contains("like-button")) 
        {
            // récupération de l'id du post
            const post_id = event.target.dataset.postId;
            
            // si l'utilisateur avait déja liké
            if (has_liked) 
            {
                document.querySelector("like-btn").style.color="";
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
                        const likes_btn=document.querySelectorAll(".uil-heart-sign");
                        likes_btn.forEach(like_btn => {
                            if (like_btn.getAttribute("data-post-id")===post_id) 
                            {
                                like_btn.style.color="red";
                            }
                        });
                        
                    } else {
                        console.error("Error liking post:", data.error);
                    }
                })
                .catch(error => console.error("Error:", error));
            }
            
        }
        else if(event.target.classList.contains("like-button"))
        {
            // récupération de l'id du post
            const post_id=event.target.dataset.postId;
            // envoyer une requête pour enregistrer le commentaire
        }
    });
}
home();