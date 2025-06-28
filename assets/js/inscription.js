console.log("Something")
// récupération des champs du formulaire 
const register_form=document.querySelector("form");
const nom=document.getElementById("name");
const prenom=document.getElementById("firstname");
const pseudo=document.getElementById("pseudo");
const email=document.getElementById("email");
const password=document.getElementById("password");
const password_confirm=document.getElementById("password_confirm");
const remember=document.getElementById("remember");

// ajout d'un écouteur d'évènement pour prévenir la soumission du formulaire
register_form.addEventListener("submit", function (event) {
    event.preventDefault();
    // vérification des champs du formulaire
    let is_form_valid=true;

    const div_errors=document.querySelectorAll(".error-message");
    div_errors.forEach(element => {
        element.innerHTML="<span></span>";
    });

    // vérification du champ nom
    if (nom.value.trim()==="") 
    {
        document.querySelector(".nom").innerHTML="<span>Entrer votre nom</span>";
        is_form_valid=false;
    }

    // vérification du champ prenom
    if (prenom.value.trim()==="") 
    {
        document.querySelector(".prenom").innerHTML="<span>Entrer votre prenom</span>"    
        is_form_valid=false;
    }

    // vérification du champ pseudo
    if (pseudo.value.trim()==="") 
    {
        document.querySelector(".pseudo").innerHTML="<span>Entrer votre pseudo</span>";
        is_form_valid=false;  
    }

    // vérification de l'email
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(email.value.trim()==="")
    {
        document.querySelector(".mail").innerHTML="<span>Entrer votre email</span>";
        is_form_valid=false;
    }
    else if (!regex.test(email.value.trim())) 
    {
        document.querySelector(".mail").innerHTML="<span>Email invalid</span>";
        is_form_valid=false;
    }

    // vérification du mot de passe
    if (password.value.length<6) 
    {
        document.querySelector(".password").innerHTML="<span>Le mot de passe doit contenir au moins 6 caractères</span>";
        is_form_valid=false;    
    }

    // confirmation du mot de passe
    if (password.value!==password_confirm.value) 
    {
        document.querySelector(".password_confirm").innerHTML="<span>Le mot de passe ne correspond pas </span>"    
    }
});

console.log("Something")