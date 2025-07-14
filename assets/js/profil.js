const { use } = require("react");

function profil()
{
    // récupération de l'id de l'utilisateur dont on veut voir le profil
    const user_id = localStorage.getItem("view_user_id"); 
    let user_profil_data="";
       // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
    const add_friend=document.querySelector(".add_friend");
    // récupération des infos de l'utilisateur dont on veut voir le profil
    fetch(`api/profil.php?user_id="${user_id}"`)
    .then(response=>response.json())
    .then(data=>{
        user_profil_data=data.user;
        // afficher la photo de profil de l'utilisateur connecté
        user_profil.forEach(element => {
        element.src="/uploads/"+user_profil_data.profile_picture;
        });
         // afficher le pseudo de l'utilisateur connecté
        user_pseudo.forEach(element=>{
            element.textContent="@"+user_profil_data.pseudo;
        });
        
        // afficher le nom de l'utilisateur connecté
        user_name.forEach(element=>{
            element.textContent=user_profil_data.nom+" "+user_profil_data.prenom;
        })
        
    })
    .catch(error=>console.error(error));
 
    // si l'utilisateur connecté est celui dont on veut voir le profil
    if (window.user_data.id===user_id) 
    {
        // retirer le bouton d'ajour d'ami
        add_friend.remove();
    }

    // charger les posts de l'utilisateur  
        // afficher les posts de celui dont on veut voir le profil
    function print_posts(post) 
    {
        const like_color= post.liked_by_user? "red": "black";
        
        const feed=document.createElement("article");
        feed.className="post";
        feed.innerHTML=`
        <div class="post-header">
            <img class="profil" src="/uploads/${post.profile_picture}" alt="photo">
            <div class="post-author">
                <h4>${post.nom} ${post.prenom}</h4>
                <span class="post-time">${post.created_at}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            <img src="/uploads/posts/${post.image_path}" alt="post photo">
        </div>
        <div class="post-actions">
            <button><i class="far fa-thumbs-up"></i> J'aime</button>
            <button><i class="far fa-comment"></i> Commenter</button>
            <button><i class="fas fa-share"></i> Partager</button>
        </div>    
        `
        document.querySelector(".posts-section").appendChild(feed);
        // get_users_likes(post.id);

    }
    // récupérer les posts depuis le backend de l'utilisateur séléctionné
    function load_posts() {
        fetch(`/api/get_user_posts.php?user_id="${user_id}"`)
        .then(response=>response.json())
        .then(data=>{
            if (data.error==="Aucune publication trouvée") 
            {
                
            }
            else
            {
                data.forEach(post=>{
                    // afficher les posts de l'utilisateur
                
                    print_posts(post);
                
                });
            }
        })
        .catch(error=>console.error(error));
    }
    load_posts();
    add_friend.addEventListener("click",function() 
    {
        const form_data=new FormData()
        form_data.append("user_id",user_id);
        fetch("api/add_friend.php",{
            method:"POST",
            headers:{
                Accept:"application/json"
            },
            body:form_data
        })
        .then(response=> response.json())
        .then(data=>{
            console.log(data);
            
        })
        .catch(error=>console.error(error));
        
    })
    
}
profil();