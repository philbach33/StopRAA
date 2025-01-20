function initPage () {
	if (!isConnected ())
		window.location = gGlobal['ROOT'] + 'index.html';
	console.log ('initialisation de la page');
	const storedVersion = localStorage.getItem('sw_version');
	$('#version-home').html (storedVersion);
}

$(document).ready(function() {

	$('#logout-home').click (function () {
		clearInterval (checkIntervalId);
		setCookie("connected", "false", -1); 
		document.location = 'page-connexion.html';
	})

	$('#new-form').click (function () {
		document.location = 'page-form-1.html';	
	})

	$('#last-form').click (function () {
		sessionStorage.setItem('paramsPage', 'last-form');
		document.location = 'page-form-1.html';	
	})

})