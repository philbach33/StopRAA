<?php
	header('Content-Type: text/html; charset=utf-8');

	$bk_root_path = "../";
	include_once ("session.php");
	
	include_once ($bk_root_path . "sources/define.php");
	include_once ($bk_root_path . "sources/class-message.php");
	include_once ($bk_root_path . "sources/error.php");
	include_once ($bk_root_path . "sources/mysql.php");
	include_once ($bk_root_path . "sources/init-page.php");
	include_once ($bk_root_path . "sources/mails.php");
	include_once ($bk_root_path . "sources/user.php");
		
	// **********************************************************************************
	// MAIN
	// **********************************************************************************

    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $phone = $_POST['phone'];
    $city = $_POST['city'];
    $birthday = $_POST['birthday'];
    $user_id = $_POST['user_id'];

    try {

		if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['user_id'])) 
		{
	        http_response_code(400);
	        throw new Exception ($gGlobal->getMessage ('error_save_user'), 400);       
	        exit;
		}

        $where = "id = $user_id";
        $user = sql_select (TABLE_USERS, $where);
        if ($user === false)
            throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
        if ($user == NO_DATA)
            throw new Exception ($gGlobal->getMessage ('error_unknown_user'), 402);       

		$dateParts = explode('/', $birthday);

		if (count($dateParts) === 3) 
		{
		    $timestamp = $dateParts[2] . '-' . $dateParts[1] . '-' . $dateParts[0];
		} else 
		{
			$timestamp = 0;
		}

        $values['firstname'] = $firstname;
        $values['lastname'] = $lastname;
        $values['phone'] = $phone;
        $values['city'] = $city;
        console ($birthday . ' ' . $timestamp, 1);
        if ($timestamp !== 0)
        	$values['birthday'] = $timestamp;

        sql_update (TABLE_USERS, $values, $where);

        // Lecture de l'utilisateur pour retour à l'app
        $where = "id = $user_id";
        $user_infos = sql_select (TABLE_USERS, $where);
        if ($user_infos === false)
            throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
        if ($user_infos == NO_DATA)
            throw new Exception ($gGlobal->getMessage ('error_unknown_user'), 402);       
		$user = new User(['row' => $user_infos[0]], 'BY_ROW');
		$data = array ('result' => true, 'message' => $gGlobal->getMessage ('msg_save_profil_ok'), 'user_id' => $user->getId (), 'user' => $user);
	}
    catch (Exception $e) {    	
        $code = $e->getCode();
		set_error_cookie ($e->getMessage ());
		$data = array ('result' => false, 'message' => $e->getMessage (), 'code' => $e->getCode ());
    }
	echo json_encode($data);		
?>