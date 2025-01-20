<?php	

class Site
{
	var $messages;
	var $user;

    function readMessages ()
    {
    	$this->messages = new Messages;
    }

    function getMessage ($id, $params = '')
    {
    	return $this->messages->getMessage ($id, $params);
    }

    function getUser () 
    {
    	return $this->$user ?? null;
    }

    function setUser ($user = null) 
    {
    	$this->$user = $user;
    }

}

function readConfiguration ($filename)
{
	global $bk_root_path ;

	if (file_exists ($filename)) 
	{		
		$string = file_get_contents ($filename);
		$jsonArray = json_decode ($string, true);
		$global = [];
		foreach ($jsonArray as $item) {
		    $global = array_merge($global, $item);
		}		
		return $global;
	}
	else
	{
		echo "Unkown file " . $file;
		exit;
	}
}

function unique_id ($extra = 'c')
{
	$val = uniqid() . microtime();
	$val = md5($val);	
	return substr($val, 4, 16);
}

$gGlobal = new Site ();
$gGlobal->readMessages ();

if ($_SERVER['HTTP_HOST'] == 'localhost')
	$bk_config_site = readConfiguration (FILE_LOCAL_CONFIGURATION);
else
	$bk_config_site = readConfiguration (FILE_SERVER_CONFIGURATION);

// ************************************************************
// MAIN
// ************************************************************
if (isset ($bk_config_site["BASE"]) && $bk_config_site["BASE"] != "none")
{
	sql_connect ($bk_config_site["BASE_SERVER"], $bk_config_site["BASE_NAME"], $bk_config_site["BASE_USER"], $bk_config_site["BASE_PWD"]);
}

if (!isset($_SESSION['session_id'])) $_SESSION['session_id'] = md5(uniqid() . microtime());
setlocale (LC_TIME, 'fr_FR.utf8','fra');	

?>