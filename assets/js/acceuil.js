const user_profil=document.querySelectorAll(".user_profile");
const user_pseudo=document.querySelectorAll(".user_pseudo");
const create_post=document.getElementById("create_post");
const post=document.querySelector(".create-post");
const postImageInput = document.getElementById("post_image");
const imagePreview = document.getElementById("image_preview");
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
    
    document.getElementById("post_text").placeholder=`What's on your mind, ${window.user_data.name}`;
})
.catch(error=>console.error(error))
create_post.addEventListener("click", function () {
    // récupérer le texte du post

    // envoyer les informations du post au backend pour l'enregistrement
        // stockage des infos du post dans post_data
    const post_data=new FormData(post);
    fetch("/api/create_post.php",{
        method:"POST",
        headers:{
            Accept:'application/json',
        },
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
        }
        else
        {
            console.log(data.error)
        }
    })
    .catch(error=>console.error(error)
    )
})

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
// charger les posts de l'utilisateur  
// afficher les posts de l'utilisateur
function print_posts(post) 
{
    const feed=document.createElement("div");
    feed.className="feed";
    feed.innerHTML=`
    <div class="head">
        <div class="user">
            <div class="profile-photo">
                <img  src="/uploads/${post.profile_picture}" alt="">
            </div>
            <div class="info">
                <h3>${post.nom} ${post.prenom}</h3>
                <small>${post.created_at}</small>
            </div>
        </div>  
        <span class="edit">
            <i class="uil uil-ellipsis-h"></i>
        </span>
    </div>
    <div class="photo">
        <img src="/uploads/posts/${post.image_path}" alt="">
    </div>
    <div class="action-button">
        <div class="interaction-buttons">
            <span><i class="uil uil-heart"></i></span>
            <span><i class="uil uil-comment-dots"></i></span>
            <span><i class="uil uil-share-alt"></i></span>
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
            ${post.nom} ${post.prenom} <span>${post.content}</span>
        </p>
    </div>
    <div class=" comments text-muted">view all 277 comments </div>
    `
    document.querySelector(".feeds").appendChild(feed);
}

function load_posts() {
    fetch("/api/get_posts.php")
    .then(response=>response.json())
    .then(data=>{
        const feed=document.getElementById("feed");
        data.forEach(post=>{
            // afficher les posts de l'utilisateur
            print_posts(post);
            // console.log(post);
            console.log(post);
        });
    })
    .catch(error=>console.error(error));
}
load_posts();   