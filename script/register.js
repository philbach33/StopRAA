
$(document).ready(function() {
	
	console.log ('Page register');

    sessionStorage.setItem ('raaLastPage', getPageName ());

	function isEmail(email) {
	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	  return regex.test(email);
	}

	if (gOnline == false) {
	    console.log("La connexion a été perdue");
	    $('.bouton-submit').addClass ('disabled');
	    openPopup ('Vous devez être connecté au réseau pour vous inscrire');		
	}

	$("#form").on('submit', function (e) {

	    var errorCount = 0;
		
		if (gOnline == false) {
		    openPopup ('Vous devez être connecté au réseau pour vous inscrire');		
			return false;
		}

		$(".error").html("");

	    if ($("#email").val().length == 0) {
		    errorCount ++;
		    $("#error-email").html ("L'adresse email est absente");
	    } else
	    if (isEmail ($("#email").val()) == 0) {
		    errorCount ++;
		    $("#error-email").html ("L'adresse email est mal formée");
	    }

	    if ($("#password").val().length == 0) {
		    errorCount ++;
		    $("#error-pwd").html ("Le mot de passe est absent");
	    } else {
			if ( $("#password").val().length < 8 ) {
				errorCount ++;
			    $("#error-pwd").html ("Le mot de passe doit avoir au moins 8 caractères");
			} else { 	
				var pswd = $("#password").val();
				//validate letter
				if (!pswd.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
					errorCount ++;
				    $("#error-pwd").html ("Le mot de passe doit contenir au moins un caractère spécial");
				}

				//validate capital letter
				if ( !pswd.match(/[A-Z]/) ) {
					errorCount ++;
				    $("#error-pwd").html ("Le mot de passe doit contenir au moins une majuscule");
				}

				//validate number
				if ( !pswd.match(/\d/) ) {
					errorCount ++;
				    $("#error-pwd").html ("Le mot de passe doit contenir au moins un chiffre");
				} 	
			}					    	
	    }

		if ( $("#password").val() != $("#password-confirm").val() ) {
			errorCount ++;
		    $("#error-pwd-confirm").html ("Les mots de passe saisis sont différents");
		}

	    if ($("#firstname").val().length == 0) {
		    errorCount ++;
		    $("#error-firstname").html ("Le prénom d'utilisateur est absent");
	    }

	    if ($("#lastname").val().length == 0) {
		    errorCount ++;
		    $("#error-lastname").html ("Le nom d'utilisateur est absent");
	    }

        if(errorCount==0) {

			const loginData = {
			    email: $('#email').val(),
			    password: $('#password').val(),
			    firstname: $('#firstname').val(),
			    lastname: $('#lastname').val()			    
			};

		    fetch("../sources/ajax-register-submit.php", {
			    method: "POST", // Type de requête (POST/GET)
			    headers: {
			        "Content-Type": "application/json", // Envoie les données en JSON
			    },
			    body: JSON.stringify(loginData),      
		    })
		    .then(response => {
			    if (!response.ok) {
			        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
			    }
			    return response.json();
		    })
			.then(data => {
			    console.log("Réponse du serveur :", data);
			    if (data.result == true) {
			    	openMessageWindow (data.message, gGlobal['ROOT'] + 'index.html');
			    }
			    else {
			    	openPopup (data.message);
			    }
			})
		    .catch((err) => {
		        console.error("Échec de l'envoi :", err);
		    });
	        e.preventDefault();
            return true;
        }
		e.preventDefault();
        return false;
	});		
});
