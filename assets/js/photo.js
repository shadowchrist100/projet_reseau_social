function photo() 
{
    // récupération de l'id de l'utilisateur dont on veut voir le profil
    const user_id = localStorage.getItem("view_user_id"); 
    const user_data=JSON.parse(localStorage.getItem("user_data"));
    const user_photos=JSON.parse(localStorage.getItem("user_photos"));
    console.log(user_photos);
    

    let user_profil_data="";
        // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
    const add_friend=document.querySelector(".add_friend");
    const add_friend_btn_text=document.querySelector(".add_friend_btn_text");
    const publications_link=document.querySelector(".publications_link");
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

    // afficher message quand on click sur message
    message.addEventListener("click", function(){
        load_view("chat");
    });

    // afficher les amis quand l'utilisateur click sur le bouton ami
    publications_link.addEventListener("click", function(event) {
        // empêcher le lien de se déclencher
        event.preventDefault();
        load_view("profil");
    });


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
   
     function show_pictures(image) 
    {
        const img=document.createElement("img");
        img.src = `uploads/posts/${image.image_path}`;
        img.alt = "post photo";
        
        document.querySelector(".photos-grid").appendChild(img);
    }

    user_photos.forEach(photo=>{
        if (photo.image_path) {
            console.log(photo);
            
            show_pictures(photo)    
        }
    })
}
photo();