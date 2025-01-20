<?php
	header('Content-Type: text/html; charset=utf-8');

	$bk_root_path = "../";
	include_once ("session.php");
	
	include_once ($bk_root_path . "sources/define.php");
	include_once ($bk_root_path . "sources/class-message.php");
	include_once ($bk_root_path . "sources/error.php");
	include_once ($bk_root_path . "sources/mysql.php");
	include_once ($bk_root_path . "sources/init-page.php");
//	include_once ($bk_root_path . "sources/user.php");

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
	
	if ( !isset($_POST['submit']) )
	{
		// Formualire non validé 
		Error (E_FORM_SUBMIT, "Inscription");
	}

	$firstname = $_POST['firstname'];
	$lastname = $_POST['lastname'];
	$pwd = $_POST['password'];
	$email = strtolower($_POST['email']);
	$confirm_code = unique_id ();	
	$error = '';

	if (empty ($email) || empty ($pwd))
	{
		$_SESSION['RET_POST'] = $_POST;	
		$error = $gGlobal->getMessage ('empty-user-email');		
		set_error_session ($error);		
		header ('Location: ' . $bk_root_path . 'out/page-register.html');		
	}

	unset_error_cookie ();
    try {

		$values['email'] = $email;
		$values['firstname'] = $firstname;
		$values['lastname'] = $lastname;
		$values['pwd'] = md5($pwd);
	    $values['confirm_code'] = unique_id ();
	    $values['status'] = 'STEP_EMAIL';

	    $user = sql_select (TABLE_USERS, 'email="'.$email.'"');
	    if ($user === false)
	        throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
	    if ($user !== NO_DATA)
	        throw new Exception ("Email déjà enregistré", 401);       
	    if (($result = sql_insert (TABLE_USERS, $values)) !== false)
	    {
	        $user_id = sql_last_insert_id ();
	    }

		header ('Location: ' . $bk_root_path . 'out/page-register.html');				

/*		$row['email'] = $email;
		$row['firstname'] = $firstname;
		$row['lastname'] = $lastname;
		$row['group_id'] = $group['id'];
		$row['id'] = $result['user_id'];

		$user = new User(['row' => $row], 'BY_ROW'); 
		
		$gGlobal->setUser ($user);

		$confirm_code = $result['confirm_code'];
		$mail = new Email();
		$mail->setRecipient ($user);

		if ($mail->sendCodeConfirmRegister ($confirm_code) !== false)
		{		
			set_session ('register-confirm-id', $result['user_id']);
			header ("Location: ../index.php?page=confirm");				
			exit;
		}
*/
	}
    catch (Exception $e) {
        $code = $e->getCode();
		$_SESSION['RET_POST'] = $_POST;	
		set_error_cookie ($e->getMessage ());
		header ('Location: ' . $bk_root_path . 'out/page-register.html');				
    }
?>