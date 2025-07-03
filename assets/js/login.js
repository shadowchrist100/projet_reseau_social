function init_login()
{
        // récupération des champs du formulaire 
    const login_form=document.querySelector("form");
    const login_nom=document.getElementById("login-name");
    const login_pseudo=document.getElementById("login-pseudo");
    const login_email=document.getElementById("login-email");
    const login_password=document.getElementById("login-password");
    const div_nom=document.querySelector(".nom");
    const div_pseudo=document.querySelector(".pseudo");
    const div_mail=document.querySelector(".mail");
    const div_passw=document.querySelector(".password");
    const mp_forgot=document.getElementById("mp_forgot");

    // ajout d'un écouteur d'évènement pour prévenir la soumission du formulaire
    login_form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        // vérification des champs du formulaire
        let is_form_valid=true;
        const div_errors=document.querySelectorAll(".error-message");
        div_errors.forEach(element => {
            element.innerHTML="<span></span>";
        });

        // vérification du champ nom
        if (login_nom.value.trim()==="") 
        {
            div_nom.innerHTML="<span>Entrer votre nom</span>";
            is_form_valid=false;
        }

        // vérification du champ pseudo
        if (login_pseudo.value.trim()==="") 
        {
            div_pseudo.innerHTML="<span>Entrer votre pseudo</span>";
            is_form_valid=false;  
        }

        // vérification de l'email
        const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(login_email.value.trim()==="")
        {
            div_mail.innerHTML="<span>Entrer votre email</span>";
            is_form_valid=false;
        }
        else if (!regex.test(login_email.value.trim())) 
        {
            div_mail.innerHTML="<span>Email invalid</span>";
            is_form_valid=false;
        }

        // vérification du mot de passe
        if (login_password.value.length<6) 
        {
            div_passw.innerHTML="<span>Le mot de passe doit contenir au moins 6 caractères</span>";
            is_form_valid=false;    
        }

        // si le formulaire est valide 
        if (is_form_valid) 
        {
            // envoi des informations du formulaire au back end
            const form_data = new FormData(login_form); // form remplit automatiquement form_data avec les valeurs des champs ayant un attribut name
            async function logged(form_data) 
            {
                try {
                    const form_send=await fetch("/api/login.php",{
                        method:'POST',
                        headers:{
                        Accept:'application/json',
                        }, 
                        body:form_data,
                    });
                    const resultat=await form_send.json();
                    document.getElementById("form-error").innerHTML=`<span>${resultat['error']}</span>`
                    console.log("Réussite:",resultat);
                    if (!resultat['error']) 
                    {
                        if (resultat["role"]==="user") 
                        {
                            load_view("acceuil"); 
                        }
                        else
                        {
                            load_view("dashboard");
                        }  
                    }
                }
                catch(error)
                {
                    console.error("Erreur:",error);
                }

            };
            logged(form_data);        
        }
    });

    // si l'utilisateur veut créer un compte
    document.getElementById("create_account").addEventListener("click", function(){
        load_view("register");
    });
}
init_login();