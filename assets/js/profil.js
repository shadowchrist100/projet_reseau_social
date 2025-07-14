function profil()
{
    // récupération de l'id de l'utilisateur dont on veut voir le profil
    const user_id = localStorage.getItem("view_user_id"); 
    let user_profil_data="";
       // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
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
 
    
}
profil();