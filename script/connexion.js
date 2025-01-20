//window.addEventListener("online", () => syncLocalData ('login'));

function initPage () {
	sessionStorage.setItem ('raaLastPage', getPageName ());
}

$(document).ready(function() {
	
	//removeLoginFromIndexedDB (2);
	//readLoginInfos ('r','t');

	if (gGlobal['errorMessage'] != null) {
		var $error = $("#connexion-wrapper #form #server-error");
		$error.html (gGlobal['errorMessage']);
		$error.removeClass ('hide');
	}

	$("a.post").click(function(e) {
	    e.stopPropagation();
	    e.preventDefault();
	    var href = this.href;
	    inputs = '<input type="hidden" name="_email" value="' + $("#email").val() + '" />';
	    $("body").append('<form action="'+href+'" method="post" id="poster">'+inputs+'</form>');
	    $("#poster").submit();
	});

	function isEmail(email) {
	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	  return regex.test(email);
	}

	$("#form").on('submit', function (e) {
		
		console.log ('Validation login');
	    
	    var errorCount = 0;
		$("#error-email").html ("");
		$("#error-pwd").html ("");
		
		resetError ();

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
	    }

        if(errorCount == 0 && !navigator.onLine) {
        	console.log ('Connexion hors ligne');
		    if (gUser.hash != null && gUser.email !== null) {
		    	console.log ('Vérification user/pwd cookie');
			    const hash = CryptoJS.SHA256 ($('#password').val()).toString();
			    if (gUser.email == $('#email').val()) {
		            if (hash == gUser.hash) {
		            	console.log ('Login validé');
				        setCookie("connected", "true", gExpiration);
				        document.location = '/raa/out/page-home.html';		            	
		            }
		            else {
		            	console.log ('!! Login non validé !!');
		            	openPopup ('Mot de passe non reconnu');
		            }
			    }
			    else {
		           openPopup ('Email inconnu ou erreur de saisie (' + $('#email').val() + ')');
			    }
		    }
		    else {
		    	console.log("Se connecter avec un accès réseau pour valider le compte Utilisateur");
		        setCookie("connected", "false", -1); 
               	openMessageWindow ('Veuillez vérifier votre connexion Internet pour continuer. Une connexion active est requise pour vous authentifier', 'page-connexion.html');
			}
			return false;
        }        
        else if(errorCount == 0 && navigator.onLine) {
        	console.log ('Connexion en ligne');

			const loginData = {
			    username: $('#email').val(),
			    password: $('#password').val()
			};

		    fetch("../sources/ajax-login-submit.php", {
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
				    var timestamp = Date.now();
				    if (gUser == null) { // Pas enregistrer en local
					    const toSave = { id: 1, user: data.user, timestamp: timestamp };
						addData ("login", toSave)
			                .then ((id) => {
						        setCookie("connected", "true", gExpiration); // Défini pour 24h
						        document.location = '/raa/out/page-home.html';
			                })
			                .catch ((error) => {
			                    console.error("Erreur lors de l'enregistrement dans IndexedDB :", error);
						        setCookie("connected", "false", 0); // Défini pour 24h
			                    openPopup ('Erreur lors de l\'enregistrement dans IndexedDB :' + error);
			                });			    			    	
			        }
			        else {
					    const toSave = { user: data.user, timestamp: timestamp };
						updateData ("login", 1, toSave)
			                .then ((id) => {
						        setCookie("connected", "true", gExpiration); // Défini pour 24h
						       	document.location = '/raa/out/page-home.html';
			                })
			                .catch ((error) => {
			                    console.error("Erreur lors de l'enregistrement dans IndexedDB :", error);
						        setCookie("connected", "false", 0); // Défini pour 24h
			                    openPopup ('Erreur lors de l\'enregistrement dans IndexedDB :' + error);
			                });			    			    	
			        }
			    }
			    else {
			    	$('#server-error').hide ();
			    	openPopup (data.message);
			    }
			})
		    .catch((err) => {
		        console.error("Échec de l'envoi :", err);
		    });
        }
        e.preventDefault();
	});		
});
