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
    $user_id = $_POST['user_id'];

    try {

		if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_FILES['pdf'])) 
		{
	        http_response_code(400);
	        throw new Exception ($gGlobal->getMessage ('error_upload_pdf'), 400);       
	        exit;
		}
	    // Récupérer le fichier envoyé
	    $pdfFile = $_FILES['pdf'];
		    
	    // Vérifier si le fichier a bien été téléchargé
	    if ($pdfFile['error'] !== UPLOAD_ERR_OK) {
	        http_response_code(400);
	        throw new Exception ($gGlobal->getMessage ('error_upload_pdf'), 400);       
	        exit;
	    }

        $where = "id = $user_id";
        $user = sql_select (TABLE_USERS, $where);
        if ($user === false)
            throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
        if ($user == NO_DATA)
            throw new Exception ($gGlobal->getMessage ('error_unknown_user'), 402);       

        $user = $user[0];
        if ($user['status'] != 'ENABLED')
        	throw new Exception ($gGlobal->getMessage ('error_step_enabled_validation'), 403); 

        $where = 'roles = "ADMIN"';
        $admin = sql_select (TABLE_USERS, $where);
        if ($admin === false)
            throw new Exception ($gGlobal->getMessage ('error_technic'), 500);       
        if ($admin == NO_DATA)
            throw new Exception ($gGlobal->getMessage ('error_unknown_admin_user'), 402);       

        $admin = $admin[0];
        if ($admin['status'] != 'ENABLED')
        	throw new Exception ($gGlobal->getMessage ('error_step_enabled_validation'), 403); 

		$admin = new User (['row' => $admin], 'BY_ROW'); 
		$mail = new Email();
		$mail->setRecipient ($admin);
		$mail->setAttached ($pdfFile['tmp_name'], $pdfFile['name']);
		$mail->sendPDF ($user, $firstname, $lastname);
		
		$data = array ('result' => true, 'message' => $gGlobal->getMessage ('msg_send_pdf_ok'), 'user_id' => $user_id);
	}
    catch (Exception $e) {    	
        $code = $e->getCode();
		set_error_cookie ($e->getMessage ());
		$data = array ('result' => false, 'message' => $e->getMessage (), 'code' => $e->getCode ());
    }
	echo json_encode($data);		
?>