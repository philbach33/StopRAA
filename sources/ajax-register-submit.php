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

	/**
	* Delete code confirmation 
	*/
	function DeleteConfirmCode ($confirm_id)
	{
		$sql = "delete from code_confirm where id='$confirm_id'";
		$result = mysql_query($sql);
		if ($result == false)
		{
			SetError (FATAL_ERROR, 'ERR_SQL', $sql); 
			return false;
		}			
		else
			return true;
	}
		
	// **********************************************************************************
	// MAIN
	// **********************************************************************************

    $input = file_get_contents('php://input');
    $data = json_decode($input, true); // Conversion en tableau associatif

	$firstname = $data['firstname'] ?? null;
	$lastname = $data['lastname'] ?? null;
	$pwd = $data['password'] ?? null;
	$email = strtolower($data['email']) ?? null;
	$confirm_code = unique_id ();	
	$error = '';

	unset_error_cookie ();
    try {

		if (empty ($email) || empty ($pwd))
		{
	        throw new Exception ($gGlobal->getMessage ('error_user_email'), 500);       
		}

		$confirm_code = unique_id ();

		$values['email'] = $email;
		$values['firstname'] = $firstname;
		$values['lastname'] = $lastname;
		$values['pwd'] = md5($pwd);
	    $values['confirm_code'] = $confirm_code;
	    $values['status'] = 'STEP_EMAIL';

	    $user = sql_select (TABLE_USERS, 'email="'.$email.'"');
	    if ($user === false)
	        throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
	    if ($user !== NO_DATA)
	        throw new Exception ($gGlobal->getMessage ('error_email_exist'), 401);       
	    
	    if (($result = sql_insert (TABLE_USERS, $values)) !== false)
	    {
	        $user_id = sql_last_insert_id ();
	    }
		
		$user_id = 400;

		$row['email'] = $email;
		$row['firstname'] = $firstname;
		$row['lastname'] = $lastname;
		$row['id'] = $user_id;

		$user = new User(['row' => $row], 'BY_ROW'); 
		
		$gGlobal->setUser ($user);

		$mail = new Email();
		$mail->setRecipient ($user);

		$mail->sendCodeConfirmRegister ($confirm_code);
		$data = array ('result' => true, 'message' => $gGlobal->getMessage ('msg_confirm_register_mail'), 'user_id' => $user_id);
	}
    catch (Exception $e) {    	
        $code = $e->getCode();
		set_error_cookie ($e->getMessage ());
		$data = array ('result' => false, 'message' => $e->getMessage (), 'code' => $e->getCode ());
    }
	echo json_encode($data);		
?>