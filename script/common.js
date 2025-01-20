var gOnline = false;
var gUser = null;
const gExpiration = 50;
const gExpiredServer = 50;
var gMessages = [];

resetError ();

gGlobal['errorMessage'] = sessionStorage.getItem("errorMessage")!=''?sessionStorage.getItem("errorMessage"):null;
gGlobal['paramsPage'] = sessionStorage.getItem ('paramsPage') !== null ? sessionStorage.getItem ('paramsPage') : 'none';

// Gestion des pages
sessionStorage.setItem('raaLastPage', sessionStorage.getItem("raaCurrentPage"));
sessionStorage.setItem('raaCurrentPage', window.location.pathname);
sessionStorage.setItem('paramsPage', 'none');

const storedVersion = localStorage.getItem('sw_version');

function openPopup (message = '') {
	if (message != '') {
		$("#popup #wrapper").html ('<div>' + message + '</div>');
	}
	$('#popup').addClass ('active');
	$('#popup').css ('top', '0');
}

function displayUserIcon () {
    const container = document.getElementById('user-menu');
    const imgPath = '../assets/icons/user-doctor.svg';
	if (isConnected ()) 
    	container.innerHTML = `<img src="${imgPath}" alt="Network Status Icon">`;

/*    fetch('../assets/icons/user-doctor.svg')
        .then(response => response.text())
        .then(svgText => {
            // Ajouter le contenu SVG dans le conteneur
            if (elementExists ('#user-menu')) {
	            document.getElementById('user-menu').innerHTML = svgText;

	            // Modifier les couleurs noires en gris clair
	            const svg = document.querySelector('#user-menu svg');
	            if (isConnected ()) 
		        	svg.setAttribute('style', 'color: white; fill: #FFFFFF;');
		        else
		        	svg.setAttribute('style', 'display: none');
	            const elements = svg.querySelectorAll('[fill="black"]');
	            elements.forEach(el => {
	                el.setAttribute('fill', 'red');
	            });            	
            }
        })
        .catch(error => console.error('Erreur lors du chargement du SVG:', error));		
        */
}

// Définir un cookie avec une durée

function getMessage (msg) {	
    const message = gMessages.find(item => item.name === msg);
    if (message) {
    	if (Array.isArray (message.msg)) {
			return message.msg.join('');
    	}
		else
      		return message.msg;
    }
}


function setCookie(name, value, minutes) {
    const now = new Date();
    let	expirationTimestamp = now.getTime() + minutes * 60 * 1000;
	
	if (minutes == 0)
   		expirationTimestamp = now.getTime() + 100000 * 60 * 1000;
   	if (minutes == -1)
   		expirationTimestamp = now.getTime() - 100000 * 60 * 1000;
    const cookieValue = `${value}|${expirationTimestamp}`; // Stocke "true|timestamp"
    now.setTime(expirationTimestamp);
    console.log ('setCookie ' + name + ':', now.toUTCString(), expirationTimestamp);
    document.cookie = `${name}=${cookieValue}; expires=${now.toUTCString()}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}

function formatDateFromTimestamp (timestamp) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0'); // Jour
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (0-indexé)
    const year = date.getFullYear(); // Année

    const hours = String(date.getHours()).padStart(2, '0'); // Heures
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Secondes

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

function getPageName () {
	const fullPath = window.location.pathname;
	const page = fullPath.substring(fullPath.lastIndexOf('/') + 1).split('.')[0];
	if (page == '' || page == 'index')
		return 'portail';
	else
		return page;
}

function isConnected () {
    const cookieValue = getCookie("connected");
    if (cookieValue) {
        const [status, expiration] = cookieValue.split("|");
        const expirationTimestamp = parseInt(expiration, 10); // Convertit la timestamp en nombre

        if (status === "true" && !isNaN(expirationTimestamp)) {
            const now = Date.now();
            if (now < expirationTimestamp) {
                return true;
            }
            else
            	console.log ('Cookie expired:', now - expirationTimestamp);
        }
    }
    return false;
}

function isIndexedDBExpired () {
;
    const now = new Date();
	const deltaTime = (now - parseInt (gUser.timestamp)) / (1000 * 60); // En minutes

	if (!gUser || deltaTime < gExpiredServer) {
		return false;
	}
	else {
		console.log ('Session indexedDB expirée');
		return true;
	}
}


function checkConnection() {
	//console.log ('check' + ' ' + isConnected ());
	if (isConnected () == false && 
		getPageName () != 'page-connexion' && 
		getPageName () != 'page-register' && 
		getPageName () != 'portail' && 
		getPageName () != 'page-message') {
    	console.warn("Utilisateur déconnecté, redirection vers la page de connexion.");
    	if (isIndexedDBExpired ())
        	openMessageWindow ('La session a expiré. Par des raisons de sécurité, vous devez avoir une connexion internet active pour vous authentifier', 'page-connexion.html');
        else
        	openMessageWindow ('La session a expiré. Par sécurité, vous devez vous authentifier', 'page-connexion.html');
    	//window.location.href = "page-connexion.html"; // URL de la page de connexion
	}
}

function setError (message) {
	sessionStorage.setItem('errorMessage', message);
}

function resetError (message) {
	sessionStorage.setItem('errorMessage', '');
}

function openMessageWindow (message, href) {
	const json = JSON.stringify ({ message: message, href: href });
	sessionStorage.setItem('raaMessage', json);
	window.location = gGlobal['PATH'] + 'out/page-message.html';
}

function capitalize (word) {
    if (!word) return ''; // Vérifie si le mot est vide ou null
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function updateMenu () {
	if (isConnected () !== true) {
		$('#menu #logout').addClass ('hide');
		$('#menu #profil').addClass ('hide');
	}
	else {
		$('#menu #logout').removeClass ('hide');
		$('#menu #profil').removeClass ('hide');		
	}
}

function isValidDate (dateString) {
    // Vérifie que la date est bien au format jj/mm/aaaa
    const regex = /^([0-2][0-9]|3[01])\/([0][1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) {
        return false; // Le format n'est pas correct
    }

    // Extraire les parties de la date
    const [day, month, year] = dateString.split('/');

    // Créer un objet Date avec les parties
    const date = new Date (year, month - 1, day); // Les mois en JS commencent à 0 (janvier = 0)

    // Vérifier si la date est valide
    return date.getDate () == day && date.getMonth () == month - 1 && date.getFullYear () == year;
}

function isSafariOniOS () {
	
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Vérifier si on est sur iOS
  const isIOS = /iP(hone|od|ad)/.test(userAgent);

  // Vérifier si on est sur Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

  return isIOS && isSafari;
}

var init = false;
document.addEventListener('DOMContentLoaded', async () => {

	try {
		if (getPageName () == 'page-message' || getPageName () == 'portail'  || getPageName () == 'page-register') {
			return;
		}

	  	await initDB();

	  	// Récupérer des données
		const savedData = await getData('login', 1);
	    if (savedData !== undefined) {

    	    const now = new Date();
			const deltaTime = (now - parseInt (savedData.timestamp)) / (1000 * 60); // En minutes

	    	if (deltaTime < gExpiredServer) {
		    	gUser = savedData.user;
		    	gUser.timestamp = savedData.timestamp;
		    	console.log('Utilisateur récupéré :', gUser);
		    	console.log('Date dernier connexion :', formatDateFromTimestamp (savedData.timestamp));
		    	if (elementExists("#email"))
		    		document.getElementById("email").value = gUser.email;
		    	hashCode = gUser.pwd;
		    	userEmail = gUser.email;
		    	updateMenu ();
		    	init = true;
	    	}
	    	else {
	    		gUser = 0;
	    		/*if (sessionStorage.getItem ('raaLastPage') != 'page-message') {
		    		console.log ('Nécessite une reconnexion au réseau');
			        setCookie("connected", "false", -1); // Défini pour 24h
			        resetError ();
	                //setError ('La session a expiré. Par sécurité, vous devez vous reconnecter au réseau pour entrer dans l\'application');
	                openMessageWindow ('La session a expiré. Par sécurité, vous devez vous reconnecter au réseau pour entrer dans l\'application', 'page-connexion.html');
	                return;
	    		}*/
				/*if (isConnected () == false && getPageName () != 'page-connexion' && getPageName () != 'index') {
	    			window.location.href = "page-connexion.html"; // URL de la page de connexion
	    		}*/
	    	}	
	    }
	    else {
			if (!navigator.onLine) {
				openPopup ("Vous devez avoir un connexion internet pour valider le compte Utilisateur");
		    	console.log("Se connecter avec un accès réseau pour valider le compte Utilisateur");
		    }
		}
	} catch (error) {
		console.error('Erreur avec IndexedDB :', error);
	}


	checkConnection	();
   	displayUserIcon ();
   	if (init == true) {
	   	if (typeof initPage === "function") {
	   		initPage ();
   		}
   	}
});

var checkIntervalId = setInterval (checkConnection, 1000);

$(document).ready(function() {

	console.log ('Page:', getPageName ());
	if (navigator.onLine) {
		gOnline = true;		
	}

	//$('#version').html (storedVersion);
	$('#menu #footer').html (storedVersion);
	
	$(document).ready(function () {

	  // Charger le fichier JSON à l'ouverture de la page
	  $.getJSON(gGlobal['ROOT'] + 'messages.json', function (data) {
	    gMessages = data;
	    console.log('Messages chargés');
	    // Exemple d'accès à un message spécifique
	  }).fail(function (jqxhr, textStatus, error) {
	    console.error('Erreur lors du chargement du fichier JSON :', textStatus, error);
	  });

	});

	function convertDateToDDMMYYYY (dateString) {
	    // Vérifie que la date est bien au format attendu
	    if (!dateString || !/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateString)) {
	        throw new Error("Le format de la date est invalide. Attendu : yyyy-mm-dd hh:mm:ss");
	    }

	    // Extraire la partie date (yyyy-mm-dd)
	    const [datePart] = dateString.split(' ');
	    const [year, month, day] = datePart.split('-');

	    // Reformater en dd/mm/yyyy
	    return `${day}/${month}/${year}`;
	}

	function displayNetworkIcon () {
	    const container = document.getElementById('network-status');
	    const imgPath = gOnline 
	        ? '../assets/icons/wifi.svg' 
	        : '../assets/icons/wifi-offline.svg';

	    if (container)
	    	container.innerHTML = `<img src="${imgPath}" alt="Network Status Icon">`;

/*	    fetch('../assets/icons/wifi.svg')
	        .then(response => response.text())
	        .then(svgText => {
	            // Ajouter le contenu SVG dans le conteneur
	            document.getElementById('network-status').innerHTML = svgText;

	            // Modifier les couleurs noires en gris clair
	            const svg = document.querySelector('#network-status svg');
	            if (gOnline == true)
		        	svg.setAttribute('style', 'color: white; fill: #FFFFFF;');
		        else
		        	svg.setAttribute('style', 'color: white; fill: #999999;');
	            const elements = svg.querySelectorAll('[fill="black"]');
	            elements.forEach(el => {
	                el.setAttribute('fill', 'red');
	            });
	        })
	        .catch(error => console.error('Erreur lors du chargement du SVG:', error));		*/
    }

	$(window).on("offline", function () {
	    console.log("La connexion a été perdue");
	    gOnline = false;
	    displayNetworkIcon ();
	});

	// Détecter quand la connexion est rétablie
	$(window).on("online", function () {
	    console.log("La connexion est rétablie");
	    gOnline = true;
	   	displayNetworkIcon ();
	});

	$("#header #user-menu").click (function () { 
		window.location = 'page-user.html';
	});

	$("#popup #header #close").click (function () { 
		$(this).parent ().parent ().removeClass ('active');
	});

	$("#popup button").click (function () { 
		$(this).parent ().removeClass ('active');
	});

	$('#goback').click (function () {
		window.location = sessionStorage.getItem("raaLastPage");		
	});

	$("#hamburger").click (function () { 
		$('#menu').addClass ('active');
	});

	$("#menu #title #close").click (function () { 
		$(this).parent ().parent ().removeClass ('active');
	});

	$("#menu li#logout").click (function () { 
		setCookie("connected", "false", -1); 
		window.location = 'page-connexion.html';
	});

	if (getPageName () == 'page-message')
		$('#hamburger').addClass ('hide');

	updateMenu ();
	displayNetworkIcon ();
})