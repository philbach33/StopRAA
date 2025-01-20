<?php
    require_once (__DIR__ . '/class.smtp.php');
    require_once (__DIR__ . '/class.phpmailer.php'); 

    class Email {
		var $recipient;
		var $logo;
		var $attached;

	    function __construct ($rows = null)
	    {
	        global $gGlobal;
	        global $bk_root_path;

	        $this->logo = null;
	        $this->attached = null;	        
	        $this->setLogo ();
	    }

	    function setRecipient ($user) 
	    {
	        $this->recipient = $user;
	    }   

	    function setAttached ($file, $fileName) 
	    {
	        $this->attached = [];
	        $this->attached['file'] = $file;
	        $this->attached['fileName'] = $fileName;
	    }   

	    function setRecipients ($users) 
	    {
	    	$mails = array ();
	    	foreach ($users as $value) 
	    	{
				array_push ($mails, $value->getEmail ());
	    	}
	    	$this->recipient = $mails;
	    }   

	    function getLogo () 
	    {
	        return $this->logo;
	    }   

		public function getBytesFromHexString($hexdata)
		{
		    for ($count = 0; $count < strlen($hexdata); $count += 2)
		        $bytes[] = chr(hexdec(substr($hexdata, $count, 2)));

		    return implode($bytes);
		}

		public function getMimeType($imagedata)
		{
		    $imagemimetypes = array(
		        "jpg" => "FFD8",
		        "png" => "89504E470D0A1A0A",
		        "gif" => "474946",
		        "bmp" => "424D",
		        "tiff" => "4949",
		        "pdf" => "25504446",
		        "docx"=> "504B0304",
		        "doc" => "D0CF11E0A1",
		        "xlsx"=> "504B030414000600",
		        "xls" => "D0CF11E0A1B11AE1"
		    );

		    foreach ($imagemimetypes as $mime => $hexbytes) {
		        $bytes = $this->getBytesFromHexString($hexbytes);
		        if (substr($imagedata, 0, strlen($bytes)) == $bytes){
		            return $mime;
		        }
		    }

		    return false;
		}

		function sendCodeConfirmRegister ($confirm_code)
		{			
			global $bk_config_site;
			global $gGlobal;

			$user = $this->recipient;

			$subject = "Confirmation de votre inscription sur " . $bk_config_site['SITE_NAME'];
			$msg = "";

			$message = '<div style="margin-bottom: 20px">Bienvenue ' . $user->getUsername () . ' sur ' . $bk_config_site['SITE_NAME'] . ' !</div>';
			$message .= '<div style="margin-top: 20px">Pour terminer et confirmer votre enregistrement, veuillez cliquer sur le lien ci-dessous :</div>';
			$message .= '<div style="margin-top: 20px; color:blue;text-decoration:underline"><a href="' . $bk_config_site['URL'] . 'index.html?page=code&id=' . $confirm_code . '"> Je confirme mon inscription ...</a></div>';
			$message .= $this->getFooter ();

			if ($this->send ($user, $subject, $message) != true)
				throw new \Exception ($gGlobal->getMessage ('error_mail_send_code_confirm', $result['message']), $result['code']);
		}

		function sendEndRegister ()
		{			
			global $bk_config_site, $gGlobal;

			$user = $this->recipient;

			$subject = $gGlobal->getMessage ('email-end-register-subject', $bk_config_site["NAME"]);

			$message = mail_header ();
			$message .= '<p>' . $gGlobal->getMessage ('email-end-register-msg-1', $bk_config_site["URL"]) . '</p>';	
			$message .= '<p>' . $gGlobal->getMessage ('email-end-register-msg-2') . '</p>';	
			$message .= '<p>' . $gGlobal->getMessage ('email-end-register-msg-3') . '</p>';	
			$message .= $this->getFooter ();

			$result = $this->send ($user, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('mail-send-end-register-error', $result['message']), $result['code']);
		}	

		function sendValidateUser ()
		{			
			global $bk_config_site, $gGlobal;

			$user = $this->recipient;

			$subject = $gGlobal->getMessage ('email_validate_user_subject', $bk_config_site["SITE_NAME"]);

			$message = mail_header ($user->getFirstname ());
			$message .= '<p>' . $gGlobal->getMessage ('email_validate_user_msg-1') . '</p>';	
			$message .= '<p>' . $gGlobal->getMessage ('email_validate_user_msg-2', $bk_config_site['URL'] . 'out/page-connexion.html') . '</p>';	
			$message .= $this->getFooter ();

			if ($this->send ($user, $subject, $message) != true)
				throw new \Exception ($gGlobal->getMessage ('error_mail_send_validate_user', $result['message']), $result['code']);
		}	

		function sendConfirmPassword ($confirm_code)
		{			
			global $bk_config_site, $gGlobal;

			$user = $this->recipient;

			$subject = $gGlobal->getMessage ('email-confirm-password-subject', $bk_config_site["NAME"]);

			$message = mail_header ($user->getFirstname());			
			$message .= '<div style="margin-top: 20px">' . $gGlobal->getMessage ('email-confirm-password-msg-1') . '</div>';
			$message .= '<div style="margin-top: 20px">
						   <a href="' . $gGlobal->getConfiguration ('url') . '?page=password-code&id=' . $confirm_code . '">' . 
						   	$gGlobal->getMessage ('email-confirm-password-msg-2') . 
						'</a><div>';
			$message .= $this->getFooter ();
				
			$result = $this->send ($user, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('email-password-send-code-error', $result['message']), $result['code']);
		}

		/*
		*
		*/
		function sendAdminRegister ()
		{			
			global $bk_config_site, $gGlobal;

			$user = $this->recipient;

			$subject = $gGlobal->getMessage ('email_end_register_subject', $bk_config_site["SITE_NAME"]);
			
			$message = '<div style="margin-bottom: 10px">' . ucfirst($user->getFirstname()) . ' ' . ucfirst($user->getLastname()) . ' vient de s\'inscrire.</div>';
			$message .= '<div style="margin-bottom: 10px">Son adresse mail est : ' . $user->getEmail() . '</div>';
			$message .= '<div style="margin-bottom: 10px">Son adresse IP est : ' . allIPs () . '</div>';	
			$message .= '<div style="margin-bottom: 10px">Pour valider l\'utilisateur cliquez : <a href="' . $bk_config_site["URL"] . 'index.html?page=validation&id=' . $user->getId () . '">valider</a></div>';	
			$message .= $this->getFooter ();
			
	    	return $this->_send ($subject, $message);
		}

		/*
		*
		*/
		function sendPDF ($user, $firstname, $lastname)
		{			
			global $bk_config_site, $gGlobal;
			$user = $this->recipient;

			$subject = $gGlobal->getMessage ('email_send_pdf_subject', $bk_config_site["SITE_NAME"]);

			$message = mail_header ();
			$message .= '<p>' . $gGlobal->getMessage ('email_send_pdf_msg_1', ucfirst ($firstname) . ' ' . ucfirst ($lastname)) . '</p>';
			$message .= '<p>' . $gGlobal->getMessage ('email_send_pdf_msg_2', ucfirst ($user->getFirstname ()) . ' ' . ucfirst ($user->getLastname ())) . '</p>';
			$message .= $this->getFooter ();
			console ('SendPDF', 1);
	    	return $this->send ($user, $subject, $message);
		}

		/*
		*
		*/
		function notificationNewComment ($comment)
		{			
			global $bk_config_site;

			$user = $this->recipient;

			$subject = "Nouveau commentaire " . $bk_config_site["NAME"];
			
			$message =  '<div style="margin-bottom: 10px">Bonjour ' . ucfirst($user->getFirstname()) . ',</div>';
			$message .= '<div style="margin-bottom: 10px">Vous avez reçu un nouveau commentaire.</div>';
			$message .= '<div style="margin-bottom: 10px"><i>' . $comment . '</i></div>';		
			$message .= $this->getFooter ();

			$result = $this->send ($user, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('mail-notification-new-comment-error', $result['message']), $result['code']);
		}

		function notificationNewPost ($title, $content)
		{			
			global $bk_config_site;
			global $gUser, $gGlobal;

			$users = $this->recipient;

			$subject = $gGlobal->getMessage ('email-notification-subject', $bk_config_site["NAME"]);
			//popen
			$message = $gGlobal->getMessage ('email-new-post-header');
			$message .= $gGlobal->getMessage ('email-new-post-line-1', ucfirst($gUser->getUsername()));
			$message .= $gGlobal->getMessage ('email-new-post-title', $title);		
//			$message .= $gGlobal->getMessage ('email-new-post-content', $content);		
			$message .= $this->getFooter ();

			$result = $this->send ($users, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('mail-notification-new-post-error', $result['message']), $result['code']);
		}

		function notificationNewEvent ($title, $content, $href)
		{			
			global $bk_config_site;
			global $gUser, $gGlobal;

			$users = $this->recipient;

			$subject = $gGlobal->getMessage ('email-notification-subject', $bk_config_site["NAME"]);
			//popen
			$message = $gGlobal->getMessage ('email-new-event-header');
			$message .= $gGlobal->getMessage ('email-new-event-line-1', ucfirst($gUser->getUsername()));
			$message .= $gGlobal->getMessage ('email-new-event-title', $title);		
			$message .= $gGlobal->getMessage ('email-new-event-content', $content);
			$message .= $gGlobal->getMessage ('email-new-event-footer', $href);

			$message .= $this->getFooter ();

			$result = $this->send ($users, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('mail-notification-new-post-error', $result['message']), $result['code']);
		}

		function notification ($content)
		{			
			global $bk_config_site;
			global $gUser, $gGlobal;

			$users = $this->recipient;

			$subject = $gGlobal->getMessage ('email-notification-subject', $bk_config_site["NAME"]);
			//popen
			$message = $gGlobal->getMessage ('email-welcome-nouser');
			$message .= $gGlobal->getMessage ('email-notification-line-1', ucfirst($gUser->getUsername()));
			$message .= $gGlobal->getMessage ('email-notification-content', $content);		
			$message .= $this->getFooter ();

			$result = $this->send ($users, $subject, $message);
			if ($result['code'] != 200)
				throw new \Exception ($gGlobal->getMessage ('mail-notification-new-post-error', $result['message']), $result['code']);
		}


		function getFooter ()
		{
			global $bk_config_site;

			$message = '<div style="margin-top: 20px">Cordialement,</div>';
			$message .= '<div><a href="' . $bk_config_site["URL"] . '">';
			$message .= '<img style="width:100px; height: auto" src="cid:logo"/></a></div>';

			return $message;
		}

		function setLogo ()
		{
			global $bk_config_site;
           	$this->logo = $bk_config_site['LOGO'];
		}
		
    	function _send ($subject, $message, $dest = null)
		{
			global $bk_config_site;

			if ($dest == null)
				$dest = $bk_config_site["EMAIL_ADMIN"];

			$mail = new PHPMailer();
			$mail->IsSMTP(); // telling the class to use SMTP
			$mail->SMTPAuth = true;     // turn on SMTP authentication 
			$mail->IsHTML(true);
			$mail->Port = 465;
			$mail->SMTPSecure='ssl';
			$mail->SMTPDebug = 0;
			$mail->CharSet="utf-8"; 
			$mail->Host = $bk_config_site["SMTP_SERVER"];
			$mail->Username = $bk_config_site["SMTP_USER"];
			$mail->Password = $bk_config_site["SMTP_PWD"];

			$mail->Subject = $subject;

			if ($this->attached) 
			{
		        $mail->addAttachment ($this->attached['file'], $this->attached['fileName']);
			}

			if ($this->getLogo () != null)
			{
				$imagePath = '../icon-192x192.png'; //$this->getLogo ();
				$mail->AddEmbeddedImage ($imagePath, 'logo', basename($imagePath));			
			}
			
			$mail->Body = $message;
			 
			$mail->From = $bk_config_site["EMAIL_ADMIN"];
			$mail->FromName = "Notification de " . $bk_config_site["SITE_NAME"]; 
			$mail->AddAddress($dest);
			if(!$mail->Send())
			{
				throw new \Exception ($mail->ErrorInfo, 500);
			}

			return true;
		}
		
		function send ($users, $subject, $message, $from_id = 0)
		{
			global $gGlobal;
			
			$emails = '';

			if (is_array($users))
			{
				foreach ($users as $user) {
					$emails .= $user->getEmail();
					$emails .= ',';
				}
				$emails = substr($emails, 0, strlen($emails)-1);
			}
			else
				$emails .= $users->getEmail();

			$values['message'] = $message;
			$values['subject'] = $subject;
			$values['email'] = $emails;
			$values['user_id'] = $from_id;
			
	    	return $this->_send ($subject, $message, $emails);
		}

	}

    /* Envoi du serveur vers un utilisateur */
	function mail_send_message ($dest, $subject, $message, $admin_subject = "", $admin_message = "")
	{
		global $bk_config_site;

		$mail = new PHPMailer();
		$mail->IsSMTP(); // telling the class to use SMTP
		$mail->SMTPAuth = true;     // turn on SMTP authentication 
		$mail->IsHTML(true);
		$mail->Port = 465;
		$mail->SMTPSecure='ssl';
		$mail->SMTPDebug = 0;
		$mail->CharSet="utf-8"; 
		$mail->Host = $bk_config_site["SMTP_SERVER"];
		$mail->Username = $bk_config_site["SMTP_USER"];
		$mail->Password = $bk_config_site["SMTP_PWD"];

		$mail->Subject = $subject;

		if ($logo != null)
		{
			$imagePath = $logo;
			$mail->AddEmbeddedImage($imagePath, 'logo', basename($logo));			
		}
		
		$mail->Body = $message;
		 
		$mail->From = $bk_config_site["EMAIL"];
		$mail->FromName = "Notification de " . $bk_config_site["SITE_NAME"]; 
		$mail->AddAddress($dest);
		if(!$mail->Send())
		{
			Error (E_SEND_MAIL, $mail->ErrorInfo);
			return false;
		}

		return true;
	}

	function wh_email ($sujet, $message, $dest = "")
	{ 
		global $bk_config_site;

		if ($dest == "")
			$dest = $bk_config_site["EMAIL_ADMIN"];

		return mail_send_message ($dest, $sujet, $message);
	}

	function mail_send_to_user ($from, $sujet, $message)
	{
		global $bk_config_site;

		$adresses = $bk_config_site["EMAIL"];

		$mail = new PHPMailer();
		$mail->IsSMTP(); // telling the class to use SMTP
		$mail->SMTPAuth = true;     // turn on SMTP authentication 
		$mail->IsHTML(true);
		$mail->Port = 465;
		$mail->SMTPSecure='ssl';
//		$mail->SMTPDebug = 1;
		$mail->CharSet="utf-8"; 
		$mail->Host = $bk_config_site["SMTP_SERVER"];
		$mail->Username =$bk_config_site["SMTP_USER"];
		$mail->Password = $bk_config_site["SMTP_PWD"];
		
		$mail->Subject = $sujet;
		$mail->Body = $message;
		 
		$mail->From = $from;
		$mail->FromName = $from; 

		if (is_array($adresses))
		{
			foreach ($adresses as $adresse)
				$mail->AddAddress ($adresse);
		}	
		else
			$mail->AddAddress ($adresses);

		if(!$mail->Send())
		{
			//Error (E_SEND_MAIL, $mail->ErrorInfo);
			return false;
		}
		else
		{
			return true;
		}

	}

	/*
	*
	*/
	function mail_signature ()
	{
		global $bk_config_site;
		$message = '<div style="margin-top: 30px">Cordialement,</div>';
		$message .= '<div>' . $bk_config_site["SITENAME"] . '</div>';

		return $message;
	}

	/*
	*
	*/
	function mail_header ($username = '')
	{
		global $gGlobal;
		
		$message = '<style> 
						div {line-height:25px; font-family: Calibri; font-size:18px; color:#333; }
						a { color: blue; }
					</style>';
		if (!empty($username))
			$message .= '<div style="margin-bottom: 20px; margin-top: 10px;">' . $gGlobal->getMessage ('email_welcome_user', ucfirst($username)) . '</div>';
		else
			$message .= '<div style="margin-bottom: 20px; margin-top: 10px;">' . $gGlobal->getMessage ('email_welcome_nouser') . '</div>';

		return $message;
	}


	/*
	*
	*/
	function mail_envoi_message ($userFrom, $emails, $msg) 
	{
		$message = mail_header ();
		$sujet = $userFrom->firstname . " vous a écrit";
		$message .= "<div>Vous avez reçu un message de la part de <b>" . $userFrom->firstname . "</b>.</div><br>";
		$message .= "<div>" . $msg . "</div>";
		$message .= mail_signature ();
		return mail_send_to_user ($emails, $sujet, $message);
	}

	function mail_insert_table ($user_id, $dest, $subject, $message)
	{
		$values['message'] = $message;
		$values['subject'] = $subject;
		$values['destinataires'] = $dest;
		$values['device_id'] = $user_id;
		sql_insert (TABLE_MAILS, $values);
	}

	function mail_can_send ($user_id, $dest)
	{
		$where = '';
		sql_and_where ($where, 'device_id="' . $user_id . '"');
		sql_and_where ($where, 'destinataires="' . $dest . '"');
		sql_and_where ($where, 'TIMESTAMPDIFF(SECOND, date, NOW())<'.MAX_TIME_EMAIL);
		$result = sql_select(TABLE_MAILS, $where);

		if ($result == NO_DATA)
			return true;
		else
			return false;
	}

	function mail_contact ($userfrom, $text)
	{			
		global $bk_config_site;

		$subject = "Formulaire contact " . $bk_config_site["NAME"];
		$msg = "";

		$message = '<div style="margin-bottom: 20px">Bonjour ' . $bk_config_site["NAME"] . ' !</div>';
		$message .= '<div style="margin-top: 20px">Vous avez reçu un message via le formulaire contact de la part de ' . $userfrom . '</div>';
		$message .= '<div style="margin-bottom: 20px">Son adresse IP est : ' . getenv('REMOTE_ADDR') . '</div>';
		$message .= '<div style="margin-top: 20px"><i>' . $text . '</i></div>';
		$message .= mail_signature ();		
				
		return wh_email ($subject, $message, $bk_config_site["EMAIL"]);
	}

	function mail_new_message ($api, $me_id, $user, $comment)
	{			
		global $bk_config_site;

		$subject = "Nouveau message de " . $user->getFirstname();
		
		$message =  '<div style="margin-bottom: 10px">Bonjour ' . ucfirst($user->getFirstname()) . ',</div>';
		$message .= '<div style="margin-bottom: 10px">Vous avez reçu un nouveau message</div>';
		$message .= '<div style="margin-bottom: 10px"><i>' . $comment . '</i></div>';		
		$message .= mail_signature ();

		if ( !mail_can_send ($me_id, $user->getEMail()) )
			return true;

		if (wh_email ($subject, $message, $user->getEMail()) == true)
		{
			mail_insert_table ($me_id, $user->getEMail(), $subject, $message);	
			return false;
		}
		else
			return false;
	}

?>