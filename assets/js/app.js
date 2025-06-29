document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/session_check.php")
    .then(response => response.json())
    .then(data => 
    {
        if (data.authenticated) 
        {
            load_view("acceuil");
        }
        else 
        {
            load_view("login");
        }
    })
    .catch(error=>{
        document.getElementById("app").innerHTML = "<p>Une erreur est survenue lors du chargement de la vue.</p>";
        console.error(error)
    });
});

function load_view(view_name) 
{
    fetch(`/vues/clients/${view_name}.html`)
    .then(response=>response.text())
    .then(html=>
    {
        document.title = "ChatApp | " + view_name.charAt(0).toUpperCase() + view_name.slice(1);
        document.getElementById("app").innerHTML=html;
        const style=document.createElement("link");
        const script=document.createElement("script");
        const oldStyle=document.getElementById("spa-style");
        if (oldStyle) {oldStyle.remove();}
        style.rel="stylesheet";
        style.href=`/assets/css/style_${view_name}.css`;
        style.id="spa-style";
        document.head.appendChild(style);
        const oldScript=document.getElementById("spa-script");
        if (oldScript) {oldScript.remove()};
        script.src=`/assets/js/${view_name}.js?t=`+ new Date().getTime();
        script.id="spa-script";
        document.body.appendChild(script);
    })
    .catch(error=>{
        document.getElementById("app").innerHTML = "<p>Une erreur est survenue lors du chargement de la vue.</p>";
        console.error(error)
    });    
}