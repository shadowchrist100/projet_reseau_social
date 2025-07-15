function profil()
{
    // récupération de l'id de l'utilisateur dont on veut voir le profil
    const user_id = localStorage.getItem("view_user_id"); 
    const user_data=JSON.parse(localStorage.getItem("user_data"));
    
    let user_profil_data="";
       // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
    const add_friend=document.querySelector(".add_friend");
    const add_friend_btn_text=document.querySelector(".add_friend_btn_text");
    const friend_link=document.querySelector(".friend_link");
    const message=document.querySelector(".message");
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
        
        // si l'utilisateur connecté est celui dont on veut voir le profil 
        if (user_data.id===+user_id) 
        {
            // retirer le bouton d'ajour d'ami
            add_friend.remove();
        }
        else
        {
            // mettre à jour le bouton d'ajout d'ami
            friend_request_stat(user_profil_data.status);
        }
    })
    .catch(error=>console.error(error));
 
    
    

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

    // function get_users_likes(post_id)
    // {
    //     fetch(`api/get_users_likes.php?post_id=${post_id}`)
    //     .then(response=>response.json())
    //     .then(data=>{
    //         // récupération de la balise contenant les personnes ayant liké le post
    //         const liked_by=document.getElementById(post_id);
    //         if (data.success && liked_by && Array.isArray(data.likes)) 
    //         {
                
    //             // on récupére ceux qui ont liké  sauf l'utilisateur actuel
    //             const likes_sans_user= data.likes.filter(user => user.user_id !== window.user_data.id);    
                
    //             // on vérifie si l'utilisateur a déja liké une fois 
    //             has_liked = data.likes.some(user => user.user_id === window.user_data.id);

    //             // on récupére chaque élément du tableau likes sous forme d'objer user dont on affiche la photo de profil
    //             liked_by.innerHTML=data.likes.filter(user => user.user_id !== window.user_data.id).map(user => `<span><img src="/uploads/${user.profile_picture}" title="${user.nom} ${user.prenom}" alt=""></span>`).join("");
            
    //             const text = document.createElement("p"); //va contenir le nom de ceux ayant liké
                
    //             const likes = data.likes;
    //             // en fonction du nombre de personnes ayant liké on affiche un message

    //             if (has_liked && likes_sans_user.length === 0) 
    //             {
    //                 text.innerHTML = `Liked by <b>you</b>`;
    //             } 
    //             else if (has_liked && likes_sans_user.length === 1) 
    //             {
    //                 const other = likes_sans_user[0];
    //                 text.innerHTML = `Liked by <b>you</b> and <b>${other.nom} ${other.prenom}</b>`;
    //             } 
    //             else if (has_liked && likes_sans_user.length > 1) 
    //             {
    //                 text.innerHTML = `Liked by <b>you</b> and <b>${likes_sans_user.length} others</b>`;
    //             } 
    //             else if (!has_liked && likes_sans_user.length === 1) 
    //             {
    //                 const other = likes_sans_user[0];
    //                 text.innerHTML = `Liked by <b>${other.nom} ${other.prenom}</b>`;
    //             } 
    //             else if (!has_liked && likes_sans_user.length > 1) 
    //             {
    //                 text.innerHTML = `Liked by <b>${likes_sans_user[0].nom} ${likes_sans_user[0].prenom}</b> and <b>${likes_sans_user.length - 1} others</b>`;
    //             }

    //             liked_by.appendChild(text);
    //         }
    //         else
    //         {
    //             console.log("Echec de récupération")
    //         }
    //     })
    //     .catch(error=>console.error(error)
    //     );
    // } 

    function friend_request_stat(status) 
    {
        // en fonction de la relation entre l'utilisateur on affiche un message
        switch (status) {
            case "pending":
                add_friend_btn_text.textContent="Demande en cours";
                break;
            case "accepted":
                add_friend_btn_text.textContent="Amie";
                break;
            case "canceled":
                add_friend_btn_text.textContent="Demande rejetée";
                break;
            default:
                break;
        }
    }

    // afficher message quand on click sur message
    message.addEventListener("click", function(){
        load_view("chat");
    });

    // afficher les amis quand l'utilisateur click sur le bouton ami
    friend_link.addEventListener("click", function(event) {
        // empêcher le lien de se déclencher
        event.preventDefault();
        load_view("friend");
    });

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
            if (data.success) 
            {
                friend_request_stat("Demande en cours");
            }
        })
        .catch(error=>console.error(error)); 
    });

    // charger les amis
    fetch(`api/get_friends.php?user_id="${user_id}"`)
    .then(response=>response.json())
    .then(data=>{
        if (data.success) 
        {
            const friends=data.friends
            console.log(friends);
            friends.forEach(friend =>{
                show_friend(friend);
            })
            // enregistrer les amis de l'utilisateur
            const user_friends=data.friends;

        }
        else
        {
        }
    })
    function show_friend (friend)
    {
        const friend_card=document.createElement("div");
        friend_card.className="friend-card";
        friend_card.innerHTML=`
            <div class="friend-avatar">
                <img src="uploads/${friend.profile_picture}" alt="">
                <button class="friend-action"><i class="fas fa-user-minus"></i></button>
            </div>
            <div class="friend-info">
                <h3>${friend.nom} ${friend.nom}</h3>
                <p>15 amis en commun</p>
                <div class="friend-actions">
                    <button class="btn btn-primary"><i class="fas fa-comment"></i> Message</button>
                </div>
            </div>
        `
        document.querySelector(".friends-gird").appendChild(friend_card);
    }
}
profil();