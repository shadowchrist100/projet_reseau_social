function home() 
{
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
                <button class="like-btn uil uil-heart" type="button" data-post-id=${post.id}></button>
                <button type="button" class="comment-btn uil uil-comment-dots" data-post-id=${post.id}></button>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="liked-by">
            <span><img src="/assets/css/images/profile-10.jpg" alt=""></span>
            <span><img src="/assets/css/images/profile-4.jpg" alt=""></span>
            <span><img src="/assets/css/images/profile-14.jpg" alt=""></span>
            <p>Liked by <b>Ernest Achiever</b> and <b>2,321 others</b></p>
        </div>
        <div class="caption">
            <p>
                ${post.nom} ${post.prenom} <span></span>
            </p>
        </div>
        <div class=" comments text-muted">view all 277 comments </div>
        `
        is_first===true? document.querySelector(".feeds").insertBefore(feed,document.querySelector(".feeds").firstChild):document.querySelector(".feeds").appendChild(feed);
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
        fetch("/api/logout.php")
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
    document.querySelector(".feeds").addEventListener("click", function (event) {
        // vérifier si l'élément cliqué est un bouton de like
        if (event.target.classList.contains("like-btn")) {
            const post_id = event.target.dataset.postId;
            // envoyer une requête pour liker le post
            const form_data = new FormData();
            form_data.append("post_id", post_id);
            form_data.append("user_id", window.user_data.id); // ajouter l'id de l'utilisateur connecté 
            fetch("/api/like_post.php", {
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
                    // mettre à jour l'interface utilisateur si nécessaire
                } else {
                    console.error("Error liking post:", data.error);
                }
            })
            .catch(error => console.error("Error:", error));
        }
    });
}
home();