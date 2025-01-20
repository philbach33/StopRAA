function initPage () {
	console.log ('initialisation de la page', getPageName ());
	raaMessage = JSON.parse (sessionStorage.getItem ("raaMessage"));
	if (typeof raaMessage !== 'undefined' && raaMessage != null) {
		console.log ('Message', raaMessage.message);
		$('#wrapper #message').html (raaMessage.message);
		$('#wrapper #continue').data ('href', raaMessage.href);		
	}
}

$(document).ready(function() {
	initPage ();

	$('#continue').click (function () {
		document.location = $(this).data ('href');
	})
})