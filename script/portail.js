function invokeServiceWorkerUpdateFlow(registration) {
    // TODO implement your own UI notification element
    if (confirm ("Une nouvelle version de l'app est disponible. Actualiser maintenant ?")) {
            registration.waiting.postMessage('SKIP_WAITING')
    }
}

if ('serviceWorker' in navigator) {
    // wait for the page to load
    window.addEventListener('load', async () => {
        // register the service worker from the file specified
        const registration = await navigator.serviceWorker.register(gGlobal['PATH'] + 'sw.js')

        // ensure the case when the updatefound event was missed is also handled
        // by re-invoking the prompt when there's a waiting Service Worker
        if (registration.waiting) {
            invokeServiceWorkerUpdateFlow(registration)
        }

        // detect Service Worker update available and wait for it to become installed
        registration.addEventListener('updatefound', () => {
            if (registration.installing) {
                // wait until the new Service worker is actually installed (ready to take over)
                registration.installing.addEventListener('statechange', () => {
                    if (registration.waiting) {
                        // if there's an existing controller (previous Service Worker), show the prompt
                        if (navigator.serviceWorker.controller) {
                            console.log('Service Worker updatefound')
                            invokeServiceWorkerUpdateFlow(registration)
                        } else {
                            // otherwise it's the first install, nothing to do
                            console.log('Service Worker initialized for the first time')
                        }
                    }
                })
            }
        })

		navigator.serviceWorker.addEventListener('message', (event) => {
	        console.log ('[Service Worker Message]', event.data.type);
		    if (event.data.type === 'SW_VERSION') {
		        const currentVersion = event.data.version;
		        var storedVersion = localStorage.getItem('sw_version');
		        if (storedVersion) {
		        	console.log ('SW_VERSION: ', storedVersion);
		        }

		        /*if (storedVersion && storedVersion !== currentVersion) {
		            // Une nouvelle version est détectée
		            console.log(`Nouvelle version détectée : ${currentVersion}`);
		            alert('Une nouvelle version du site est disponible. Veuillez actualiser la page.');
		        }*/

		        // Mettre à jour la version en localStorage
		        localStorage.setItem('sw_version', currentVersion);
		    }
		});

        let refreshing = false;

        // detect controller change and refresh the page
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
            	console.log('Service Worker reload')
                window.location.reload()
                refreshing = true
            }
        })
    })
}
 /*
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register(gGlobal['PATH'] + "script/sw.js?v=" + gGlobal['VERSION'])
	.then(() => { 
		console.log("Service Worker Registered")
		writeToDebug ('Service Worker enregistré');
	});
}
*/

$(document).ready(function() {
	
	const storedVersion = localStorage.getItem('sw_version');

    function getQueryParameter(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    // Afficher le bloc correspondant à "page" ou le bloc par défaut
    setTimeout(() => {
    	const title = getMessage ('sitename') + `<span>${storedVersion}</span>`;
	   	const msg = getMessage ('msg_code_validation', 'page-connexion.html');
    	
    	const page = getQueryParameter('page');
	    if (page == 'code') {
			const codeData = {
			    code: getQueryParameter('id')
			};

		    fetch (gGlobal['ROOT'] + 'sources/ajax-verify-code.php', {
			    method: "POST", // Type de requête (POST/GET)
			    headers: {
			        "Content-Type": "application/json", // Envoie les données en JSON
			    },
			    body: JSON.stringify(codeData),      
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
			    	openMessageWindow (data.message, 'page-connexion.html');
			    }
			    else {
			    	openMessageWindow (data.message, gGlobal['ROOT'] + 'index.html');
			    }
				//$('#loader').removeClass ('show');
			})
		    .catch((err) => {
		        console.error("Échec de l'envoi :", err);
		    });
	    }
	    else if (page == 'validation') {
			const codeData = {
			    user_id: getQueryParameter('id')
			};

		    fetch (gGlobal['ROOT'] + 'sources/ajax-validation-user.php', {
			    method: "POST", // Type de requête (POST/GET)
			    headers: {
			        "Content-Type": "application/json", // Envoie les données en JSON
			    },
			    body: JSON.stringify(codeData),      
		    })
		    .then(response => {
			    if (!response.ok) {
			        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
			    }
			    return response.json();
		    })
			.then(data => {
			    console.log("Réponse du serveur :", data);
		    	openMessageWindow (data.message, gGlobal['ROOT'] + 'index.html');
				//$('#loader').removeClass ('show');
			})
		    .catch((err) => {
		        console.error("Échec de l'envoi :", err);
		    });
	    }
	    else {
			//$('#loader').removeClass ('show');
	    }

		$('#portail-wrapper h1').html (title);
		$('#portail-wrapper #copyright').html (getMessage ('copyright'));

    }, 50);
	
	$('#register').click (function () {
		if (!$(this).hasClass ('disabled'))
			document.location = '/raa/out/page-register.html';
	});

	$('#connexion').click (function () {
		if (!$(this).hasClass ('disabled'))
			document.location = '/raa/out/page-connexion.html';
	});

	$('#formulaire').click (function () {
		if (!$(this).hasClass ('disabled'))
			document.location = '/raa/out/page-form-1.html';
	});

	if (isConnected()) {
		$('#connexion').addClass ('disabled');
		$('#register').addClass ('disabled');
	}
	else {
		$('#formulaire').addClass ('disabled');		
	}
})