function init_register() 
{
    // récupération des champs du formulaire 
    const register_form=document.querySelector("form");
    const register_nom=document.getElementById("register-name");
    const register_prenom=document.getElementById("register-firstname");
    const register_pseudo=document.getElementById("register-pseudo");
    const register_email=document.getElementById("register-email");
    const register_password=document.getElementById("register-password");
    const register_password_confirm=document.getElementById("register-password_confirm");
    const remember=document.getElementById("remember");
    const login=document.querySelector(".login-button");

    // ajout d'un écouteur d'évènement pour prévenir la soumission du formulaire
    register_form.addEventListener("submit", function (event) 
    {
        event.preventDefault();
        // vérification des champs du formulaire
        let is_form_valid=true;

        const div_errors=document.querySelectorAll(".error-message");
        div_errors.forEach(element => {
            element.innerHTML="<span></span>";
        });

        // vérification du champ nom
        if (register_nom.value.trim()==="") 
        {
            document.querySelector(".nom").innerHTML="<span>Entrer votre nom</span>";
            is_form_valid=false;
        }

        // vérification du champ prenom
        if (register_prenom.value.trim()==="") 
        {
            document.querySelector(".prenom").innerHTML="<span>Entrer votre prenom</span>"    
            is_form_valid=false;
        }

        // vérification du champ pseudo
        if (register_pseudo.value.trim()==="") 
        {
            document.querySelector(".pseudo").innerHTML="<span>Entrer votre pseudo</span>";
            is_form_valid=false;  
        }

        // vérification de l'email
        const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(register_email.value.trim()==="")
        {
            document.querySelector(".mail").innerHTML="<span>Entrer votre email</span>";
            is_form_valid=false;
        }
        else if (!regex.test(register_email.value.trim())) 
        {
            document.querySelector(".mail").innerHTML="<span>Email invalid</span>";
            is_form_valid=false;
        }

        // vérification du mot de passe
        if (register_password.value.length<6) 
        {
            document.querySelector(".password").innerHTML="<span>Le mot de passe doit contenir au moins 6 caractères</span>";
            is_form_valid=false;    
        }

        // confirmation du mot de passe
        if (register_password.value!==register_password_confirm.value) 
        {
            document.querySelector(".password_confirm").innerHTML="<span>Le mot de passe ne correspond pas </span>"  
            is_form_valid=false;  
        }
            
        // si les informations du formulaire sont valides faire l'envoi des données au Backend
        if (is_form_valid) 
        {
            // enregister les données du formulaire dans la variable form_data
            const form_data=new FormData(register_form); // avec register_form , form_data remplit form_data avec les données des champs du formulaire ayant un name
            
            async function registered(form_data) 
            {
                try 
                {
                    const form_send=await fetch("/api/register.php",{
                        method:"POST",
                        headers:{
                            Accept:"application/json"
                        },
                        body:form_data,
                    });
                    const resultat=await form_send.json();
                    // afficher la réponse du back end si il y a d'erreur
                    if (resultat["error"]) 
                    {
                        document.getElementById("form-error").innerHTML=`<span>${resultat['error']}</span>`
                    }
                    // si il n'y a  pas d'erreur
                    if (resultat['success']) 
                    {
                        // on connecte l'utilisateur 
                        const connect=await fetch("/api/login.php",{
                        method:"POST",
                        headers:{
                            Accept:"application/json"
                        },
                        body:form_data,
                        });
                        const connect_result=await connect.json();
                        if (!connect_result['error']) 
                        {
                            load_view("acceuil");
                        } 
                        else
                        {
                            console.log(connect_result);
                            
                        }   
                    }

                }
                catch (error) 
                {
                    console.error(error);    
                }
            };
            registered(form_data);
        }

    });

    // si l'utilisateur a déja un compte veut se connecter
    login.addEventListener("click", function () {
        load_view("login");
    });

}
init_register();