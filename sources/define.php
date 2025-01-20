<?php
	define ("session", "raa_");

	define ("FATAL", 2);
	define ("WARNING", 1);
	define ("NOERROR", 0);

	define ("MAX_TIME_EMAIL", 7200); // 2 heures
			
	define ("FILE_SERVER_CONFIGURATION", $bk_root_path . "assets/parameters.json");
	define ("FILE_LOCAL_CONFIGURATION", $bk_root_path . "assets/parameters-local.json");
	define ("FILE_MESSAGES", $bk_root_path . "assets/messages.json");

	define ("IMG_PROFIL_DEFAULT", $bk_root_path . "assets/image/anonyme.jpg");
		
	define ("TABLE_CONF", "configuration");
	define ("TABLE_USERS", "users");

	define ('SOURCES', "sources/");
?>