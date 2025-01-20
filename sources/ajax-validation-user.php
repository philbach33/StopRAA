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

    $input = file_get_contents('php://input');
    $data = json_decode($input, true); // Conversion en tableau associatif

	$user_id = $data['user_id'] ?? null;

    try {

        $where = "id = $user_id";
        $user = sql_select (TABLE_USERS, $where);
        if ($user === false)
            throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
        if ($user == NO_DATA)
            throw new Exception ($gGlobal->getMessage ('error_unknown_user'), 402);       

        $user = $user[0];
        if ($user['status'] == 'STEP_EMAIL')
             throw new Exception ($gGlobal->getMessage ('error_step_email_validation'), 403); 
        else if ($user['status'] != 'STEP_ADMIN')
             throw new Exception ($gGlobal->getMessage ('error_step_enabled_validation'), 403); 

        $values['status'] = 'ENABLED';
        sql_update (TABLE_USERS, $values, $where);

		$user = new User (['row' => $user], 'BY_ROW'); 
		$mail = new Email();
		$mail->setRecipient ($user);
		$mail->sendValidateUser ();
		
		$data = array ('result' => true, 'message' => $gGlobal->getMessage ('msg_validation_user_ok'), 'user_id' => $user_id);
	}
    catch (Exception $e) {    	
        $code = $e->getCode();
		set_error_cookie ($e->getMessage ());
		$data = array ('result' => false, 'message' => $e->getMessage (), 'code' => $e->getCode ());
    }
	echo json_encode($data);		
?>