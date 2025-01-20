<?php	
	$bk_root_path = "../";

	include_once ("session.php");	

	include_once ($bk_root_path . "sources/define.php");
	include_once ($bk_root_path . "sources/class-message.php");
	include_once ($bk_root_path . "sources/error.php");
	include_once ($bk_root_path . "sources/mysql.php");
	include_once ($bk_root_path . "sources/init-page.php");
	include_once ($bk_root_path . "sources/mails.php");
	include_once ($bk_root_path . "sources/user.php");

	header('Content-Type: application/json; charset=utf-8');

/*	function check_auth ($email, $pwd)
	{
		$user = array (
			'user_id' => 1,
			'lastname' => 'lafitte', 
			'firstname' => 'stéphane', 
			'email' => 'stlafitte@gmail.com', 
			'phone' => '0677777777',
			'rpps' => 'RPPS990989898',
			'hash' => hash("sha256", 'association2017')
		);
		
		if ($email == $user['email'])
		{
			if (hash("sha256", $pwd) == $user['hash'])			
				return $user;
			else
				return 'password error';			
		}
		else
		{
			return false;
		}
	}
*/
    $input = file_get_contents('php://input');
    $data = json_decode($input, true); // Conversion en tableau associatif

    // Valider les données reçues
    $email = $data['username'] ?? null;
    $pwd = $data['password'] ?? null;
	$message = '';

	try {

		if (empty ($email)) 
			throw new Exception ('Email absent', 400);
		elseif (empty ($pwd)) 
			throw new Exception ('Mot de passe absent', 400);
		elseif ( ($result = check_auth ($email, md5 ($pwd))) !== true )
		{			
			if (is_object ($result))
			{
				$user = $result;				
				switch ($user->getStatus()) {

					case DISABLED:
						$message = $gGlobal->getMessage('user_disabled');
						throw new Exception ($message, 401);
						break;

					case STEP_EMAIL:
						$message = $gGlobal->getMessage('email_unvalidated');
						throw new Exception ($message, 401);
						break;

					case STEP_ADMIN:
						$message = $gGlobal->getMessage('msg_register_validation_admin');
						throw new Exception ($message, 401);
						break;

					case ENABLED:
						$data = array ('result' => true, 'user_id' => $user->getId (), 'user' => $user);
						break;

					default:
						$message = $gGlobal->getMessage('unkown-error');
						throw new Exception ($message, 401);
						break;
				}
			}
			else 
			{
				switch ($result) {
					case ERR_PWD_CODE:
						$message = 'Vous devez valider le nouveau mot de passe';
						throw new Exception ($message, 401);
						break;

					case ERR_ATTEMPTS_LIMIT:
						$message = $gGlobal->getMessage('user_attempts_limit');
						throw new Exception ($message, 401);
						break;

					case NO_USER:
						$message = $gGlobal->getMessage('user_unknown_email');
						throw new Exception ($message, 401);
						break;

					case ERR_PWD:
						$message = $gGlobal->getMessage('user_wrong_pwd');
						throw new Exception ($message, 401);
						break;

					case ERR_USER_NOT_FOUND:
						$message = $gGlobal->getMessage('user_unknown');
						throw new Exception ($message, 401);
						break;

					case ERR_MAIL_NOT_VALIDATED:
						$message = $gGlobal->getMessage('email-unvalidated');
						throw new Exception ($message, 401);
						break;

					default:
						$message = $gGlobal->getMessage('unkown-error');
						throw new Exception ($message, 401);
						break;
				}				
			}
		}		
	}
    catch (Exception $e) {
        $error = $e->getCode();
        $message = $e->getMessage();
		$data = array ('result' => false, 'message' => $e->getMessage (), 'code' => $e->getCode ());        
    }

	echo json_encode($data);
?>