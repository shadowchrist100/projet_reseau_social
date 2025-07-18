function friend() 
{
    // récupération de l'id de l'utilisateur dont on veut voir le profil
    const user_id = localStorage.getItem("view_user_id"); 
    const user_data=JSON.parse(localStorage.getItem("user_data"));
    const user_friends=JSON.parse(localStorage.getItem("user_friends"))
    console.log(user_friends);
    

    let user_profil_data="";
        // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
    const add_friend=document.querySelector(".add_friend");
    const add_friend_btn_text=document.querySelector(".add_friend_btn_text");
    const publications_link=document.querySelector(".publications_link");
    const message=document.querySelector(".message");
    const show_friend_btn=document.querySelector(".show-friends");
    const show_photo_btn=document.querySelector(".show-photos");
     const photo_link=document.querySelector(".photo_link");
     const acceuil_link=document.querySelector(".acceuil_link");
     const friend_link=document.querySelector(".friend_link");
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

    
    // afficher les photos quand on click sur le bouton photos
    photo_link.addEventListener("click", function (event) {
        event.preventDefault();
        load_view("photo");
    })

     // afficher la page d'acceuil
    acceuil_link.addEventListener("click", function(event){
        event.preventDefault();
        load_view("acceuil");
    })

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
    // charger les amis de l'utilisateur
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
                <h3>${friend.nom} ${friend.prenom}</h3>
                <p>15 amis en commun</p>
                <div class="friend-actions">
                    <button class="btn btn-primary"><i class="fas fa-comment"></i> Message</button>
                </div>
            </div>
        `
        document.querySelector(".friends-grid").appendChild(friend_card);
    }
    user_friends.forEach(friend=>{
         show_friend(friend);
    })
   
}
friend();