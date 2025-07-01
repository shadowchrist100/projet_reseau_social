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

    