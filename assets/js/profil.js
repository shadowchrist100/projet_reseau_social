function profil()
{
    const user_id = localStorage.getItem("view_user_id"); // => "3"
    console.log(user_id);
    
    // récupérer les éléments du DOM
    const user_profil=document.querySelectorAll(".user_profile");
    const user_pseudo=document.querySelectorAll(".user_pseudo");
    const user_name=document.querySelectorAll(".user_name");
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
}
profil();