// récupération des champs du formulaire 
            const form=document.querySelector("form");
            const nom=document.getElementById("name");
            const pseudo=document.getElementById("pseudo");
            const email=document.getElementById("email");
            const password=document.getElementById("password");
            const remember=document.getElementById("remember");
            const login=document.getElementById("login");
            const div_nom=document.querySelector(".nom");
            const div_pseudo=document.querySelector(".pseudo");
            const div_mail=document.querySelector(".mail");
            const div_passw=document.querySelector(".password");
            // ajout d'un écouteur d'évènement pour prévenir la soumission du formulaire
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                    console.log(nom);
                // vérification des champs du formulaire
                let is_form_valid=true;

                const div_errors=document.querySelectorAll(".error-message");
                div_errors.forEach(element => {
                    element.innerHTML="<span></span>";
                });

                // vérification du champ nom
                if (nom.value.trim()==="") 
                {
                    div_nom.innerHTML="<span>Entrer votre nom</span>";
                    is_form_valid=false;
                }

                // vérification du champ pseudo
                if (pseudo.value.trim()==="") 
                {
                    div_pseudo.innerHTML="<span>Entrer votre pseudo</span>";
                    is_form_valid=false;  
                }

                // vérification de l'email
                const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(email.value.trim()==="")
                {
                    div_mail.innerHTML="<span>Entrer votre email</span>";
                    is_form_valid=false;
                }
                else if (!regex.test(email.value.trim())) 
                {
                    div_mail.innerHTML="<span>Email invalid</span>";
                    is_form_valid=false;
                }

                // vérification du mot de passe
                if (password.value.length<6) 
                {
                    div_passw.innerHTML="<span>Le mot de passe doit contenir au moins 6 caractères</span>";
                    is_form_valid=false;    
                }
            });