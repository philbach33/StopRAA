function initPage () {
	console.log ('initialisation de la page');
	console.log (gUser.firstname);
	$('#wrapper #firstname').val (gUser.firstname);
	$('#wrapper #lastname').val (gUser.lastname);
	$('#wrapper #email').val (gUser.email);
	$('#wrapper #phone').val (gUser.phone);
	$('#wrapper #city').val (gUser.city);

	const dateString = gUser.birthday;
    if (!dateString || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        throw new Error("Le format de la date est invalide. Attendu : yyyy-mm-dd hh:mm:ss");
    }
    const [datePart] = dateString.split(' '); // Extrait la partie date (avant l'espace)
    const [year, month, day] = datePart.split('-');

	$('#wrapper #birthday').val (`${day}/${month}/${year}`);
}

$(document).ready(function() {
	
	$('#save').click (function () {

		if (gUser == null) {
			alert (getMessage ('error_unknown_user'));
			return false;
		}
		if (!isConnected ()) {
			openPopup (getMessage ('msg_connected_operation'));
			return false;
		}

	    const firstname = $('input[name="firstname"]').val ();
	    const lastname = $('input[name="lastname"]').val ();
	    const phone = $('input[name="phone"]').val ();
	    const city = $('input[name="city"]').val ();
	    const birthday = $('input[name="birthday"]').val ();
		const formData = new FormData();

		if (!isValidDate (birthday)) {
			openPopup (getMessage ('error-invalid-date'));
			return false;
		}

		formData.append('firstname', firstname);
		formData.append('lastname', lastname);
		formData.append('phone', phone);
		formData.append('city', city);
		formData.append('birthday', birthday);
		formData.append('user_id', gUser.id);

		$('#loader').addClass ('show');
		fetch('../sources/ajax-save-profil.php', {
			method: 'POST',
			body: formData,
		})
		.then((response) => {
		    if (!response.ok) {
		        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
		    }
			return response.json()
		})
		.then((data) => { 
		    if (data.result == true) {
				$('#loader').removeClass ('show');
				setTimeout (function () { 
					alert (data.message);
					var timestamp = Date.now();
				    const toSave = { id: 1, user: data.user, timestamp: timestamp };
					updateData ("login", 1, toSave)
		                .then ((id) => {
					        document.location = 'page-user.html';
		                })
		                .catch ((error) => {
		                    console.error("Erreur lors de l'enregistrement dans IndexedDB :", error);
					        //setCookie("connected", "false", 0); // Défini pour 24h
		                    openPopup ('Erreur lors de l\'enregistrement dans IndexedDB :' + error);
		                });			    			    	
		        }, 200);
			}
			else {
				$('#loader').removeClass ('show');
				alert (data.message);
			}
		})
		.catch ((error) => {
			$('#loader').removeClass ('show');
			alert ('ERREUR:' + error);
			console.error('Erreur:', error) 
		});	
	});

	$('input').keyup (function () {
		$('#save').removeClass ('hide');
	});

	$('#logout-profil').click (function () {
		clearInterval (checkIntervalId);
		setCookie("connected", "false", -1); 
		document.location = 'page-connexion.html';
	})
})