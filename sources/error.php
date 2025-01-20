<?php
	define ("E_SQL", 1);
	define ("E_SEND_MAIL", 2);
	define ("E_LOGIN", 3);
	define ("E_TABLE", 4);
	define ("E_FATAL", 100);

	$gErrors = array (
						array (1, "Erreur SQL", E_USER_ERROR),
						array (2, "Erreur envoi mail", E_USER_ERROR),
						array (3, "Erreur login", E_USER_ERROR),
						array (4, "Table inconnue", E_USER_ERROR),
						array (100, "Fatal Error", E_USER_ERROR)
				   );

	set_error_handler('error_handler');
	
	function error_handler ($no, $str, $file, $line)
	{
		global $gErrors;

		WriteLog ($no . '-' . $str . ' ' . $file . ' ' . $line, 'ERROR');

		switch($no)
		{
			// Erreur fatale
			case E_USER_ERROR:
				echo 'Erreur fatale : '. $str . '\n';
				echo print_r (debug_backtrace (DEBUG_BACKTRACE_IGNORE_ARGS), true);
				exit; // On arrête le script
				break;
			
			// Avertissement
			case E_USER_WARNING:
				echo 'Avertissement : ' . $str . '\n';
				break;
			
			// Note
			case E_USER_NOTICE:
				echo '<p><strong>Note</strong> : '.$str.'</p>';
				break;
		}
	}

	function get_last_error ()
	{
		return $_SESSION["LAST_ERROR"];
	}
	
	function Error ($errno, $param = "")
	{
		global $gErrors;
		global $bk_sql_connect;

		foreach ($gErrors as $error)
		{		
			if ($error[0] == $errno)
			{
				if ($param != "")
					$msg = $error[1] . " (" . $param . ")";
				else
					$msg = 	$error[1];

				if ($errno == E_SQL)
					$msg .= "(" . sql_error() . ")";
					
				WriteLog ($errno . '-' . $msg, 'ERROR');
				$_SESSION["LAST_ERROR"] = $msg;
				trigger_error($msg, $error[2]);
			}
		}
	}

	function set_error_cookie ($error)
	{
		setrawcookie ("raa_error", rawurlencode ($error), time() + 3600, "/"); // Cookie valable 1 heure
	}

	function unset_error_cookie ()
	{
		setcookie ("raa_error", -1); // Cookie valable 1 heure
	}

	/*
	*
	*/
	function unset_error_session ()
	{
		unset ($_SESSION["BK_ERROR_MSG"]);
		unset ($_SESSION["BK_ERROR_URL"]);
	}

	function set_error_session ($error)
	{
		$_SESSION['BK_ERROR_MSG'] = $error;
		$_SESSION['BK_ERROR_URL'] = $_SERVER['REQUEST_URI'];		
	}

	function get_error_session ()
	{
		if (isset($_SESSION['BK_ERROR_MSG']) && $_SESSION['BK_ERROR_MSG'] != "")
		{
			return $_SESSION['BK_ERROR_MSG'];
		}
		else
			return false;
	}

	function WriteError ($msg)
	{
		WriteLog ($msg, 'ERROR');
	}

	function WriteLog ($msg, $type = 'DEBUG')
	{
		global $bk_root_path;
		
		if (!isset ($bk_root_path)) $bk_root_path = "./";

		$dir = $bk_root_path . "log/";

		if (!is_dir($dir))
			mkdir ($dir);
		if ($type == 'DEBUG')			
			$fd = fopen ($dir . "log-root.txt", "a+");
		else
			$fd = fopen ($dir . "errors.txt", "a+");

		$msg = date("Ymd H:i:s", time()) . ": " . $msg . "\r\n";
		fputs ($fd, $msg, strlen ($msg));
		fclose ($fd);
	}

    // Affichage debug
    function console ($str, $where = 'screen')
    {
		global $bk_root_path;

        ob_start();
        if (is_array($str) || is_object($str))
        {
        	echo "<pre>";
        	var_dump ($str);
        	echo "</pre>";
        }
        else
        	print_r ($str."\n");

        $output = ob_get_clean();    	
        if (defined("CLI") || $where == 'screen')
        	echo 'console: ' . $output . '<br>';
        else {
        	file_put_contents ($bk_root_path . "log/console.log", $output, FILE_APPEND);
        }
    }


?>
