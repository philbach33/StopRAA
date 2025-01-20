<?php
/* session.inc 
Session management.
 
Instructions: Each page must include: include 'session.inc'; check_login();
 
Features:
- If the user is not authenticated, he/she will be automatically redirected to login page.
- Everything is stored on server-side (we do not trust client-side data, such as cookie expiration)
- IP addresses are checked on each access to prevent session cookie hijacking (such as Firesheep)
- Session expires on user inactivity (Session expiration date is automatically updated everytime the user accesses a page.)
- A unique secret key is generated on server-side for this session (and never sent over the wire) which can be used
  to sign forms (HMAC) or generate form tokens (to prevent XSRF attacks). (See $_SESSION['uid'] )
 
*/
 
define('INACTIVITY_TIMEOUT', 7900); // (in seconds). If the user does not access any page within this time, his/her session is considered expired.
define('VISIT', 123456);
define('ERR_NOR_CONFIRM_MAIL', 11);
define('ENABLED',  'ENABLED');
define('DISABLED',  'DISABLED');
define('GUEST',  'GUEST');
define('NOT_COMPLETED',  2);
define('STEP_EMAIL',  'STEP_EMAIL');
define('STEP_ADDRESS',  'STEP_ADDRESS');
define('STEP_PHONE',  'STEP_PHONE');
define('STEP_ADMIN', 'STEP_ADMIN');
define('STEP_CODE', 'STEP_CODE');

define('NO_USER',  'NO_USER');
define('ERR_PWD',  'ERR_PWD');
define('ERR_PWD_CODE',  'ERR_PWD_CODE');
define('ERR_ATTEMPTS_LIMIT', 'ERR_ATTEMPTS_LIMIT');
define('ERR_CLIENT_NOT_FOUND', 'ERR_CLIENT_NOT_FOUND');
define('ERR_USER_NOT_FOUND', 'ERR_USER_NOT_FOUND');
define('ERR_MAIL_NOT_VALIDATED', 'ERR_MAIL_NOT_VALIDATED');

	ini_set('session.use_cookies', 1);       // Use cookies to store session.
	ini_set('session.use_only_cookies', 1);  // Force cookies for session (phpsessionID forbidden in URL)
	ini_set('session.use_trans_sid', false); // Prevent php to use sessionID in URL if cookies are disabled.
	session_start();

function allIPs ()
// Returns the IP address of the client (Used to prevent session cookie hijacking.)
{
    $ip = $_SERVER["REMOTE_ADDR"];
    // Then we use more HTTP headers to prevent session hijacking from users behind the same proxy.
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) { $ip=$ip.'_'.$_SERVER['HTTP_X_FORWARDED_FOR']; }
    if (isset($_SERVER['HTTP_CLIENT_IP'])) { $ip=$ip.'_'.$_SERVER['HTTP_CLIENT_IP']; }
    return $ip;
}

function force_login ()
{
    $_SESSION['uid'] = sha1(uniqid('',true).'_'.mt_rand()); // generate unique random number (different than phpsessionid)
                                                            // which can be used to hmac forms and form token (to prevent XSRF)
    $_SESSION['user_ip'] = allIPs();                                // We store IP address(es) of the client to make sure session is not hijacked.
    $_SESSION['user_name'] = $email;
    $_SESSION['user_id'] = $data["ID"];
    $_SESSION['user_data'] = array ();
    $_SESSION['user_data'] = $data;
    $_SESSION['expires_on'] = time()+INACTIVITY_TIMEOUT;  // Set session expiration.
    unset ($_SESSION['login_error']);
    return true;
} 

function check_auth ($email, $password) 
// Check that user/password is correct.
{
    global $bk_sql_connect;
    global $gGlobal;

    try {
        $where = '';

        // Vérification utilisateur présent en base
        sql_and_where ($where, 'email="' . $email . '"');
        $result = sql_select (TABLE_USERS, $where);
        if ($result == NO_DATA)
        {
        	return NO_USER;
        }
        else
            $user_infos = $result[0];

        // Vérification mot de passe
        sql_and_where ($where, 'pwd="' . $password . '"');
        $result = sql_select (TABLE_USERS, $where);
        if ($result == NO_DATA)
        {
            // Ajout +1 tentatives
            $attempts = $user_infos['attempts']+1;
            if ($attempts > 3)
            	return ERR_ATTEMPTS_LIMIT;
            else
            {
                sql_update (TABLE_USERS, ['attempts' => $attempts], 'id='.$user_infos['id']);
                return ERR_PWD;
            }            
        }
	
        // SI utilisateur n'a pas encore validé son mail, pas de connexion possible
        if ($user_infos['status'] == STEP_EMAIL)
        {
        	return ERR_MAIL_NOT_VALIDATED;
        }

        // Mise à jour tentatives
        sql_update (TABLE_USERS, ['attempts' => 0], 'id='.$user_infos['id']);

		$user = new User(['row' => $user_infos], 'BY_ROW');

        set_session ('uid', sha1 (uniqid ('',true).'_'.mt_rand ()));
        set_session ('user_object', serialize ($user));
        set_session ('user_id', $user->getId ());
        set_session ('user_email', $user->getEmail ());
        set_session ('user_ip', allIPs ());                                
        set_session ('expires_on', time ()+INACTIVITY_TIMEOUT);

        return $user;
    }
    catch (Exception $e) {
        Debug ("login-error");
        return $e->getMessage();
    }
}

function set_session($var, $value)
{
    $_SESSION[$var] = $value;
}

function get_session($var)
{
    if (isset ($_SESSION[$var]))
        return $_SESSION[$var];
    return 
        NO_DATA;
}

function isset_session ($var)
{
    if (!isset ($_SESSION[$var]))
        return false;
    else 
        return true;
}

function unset_session ($var)
{
    unset ($_SESSION[$var]);
}

function refresh_token ()
{
    $refresh_token = get_session ('refresh_token');
    $refresh = api_refresh ($refresh_token);
    if ($refresh['code'] != 200)
    {
        echo "ERREUR<br>";
        return false;
    }
    else
    {
        set_session ('token', $refresh['token']);
        set_session ('refresh_token', $refresh['refresh_token']);
        return $refresh;
    }

}

function check_login ($callback = null)
// Make sure user is logged in. Redirect to login page if not.
{
    global $gGlobal;

    $api = new ApiPosting();

   	console ('Session: ' . get_session ('uid') . ' expire ' . date("d/m/Y H:i:s", get_session ('expires_on')), 1);
 
    $gGlobal->setApi ($api);

    if (!isset_session ('uid') || !isset_session ('user_ip') || time() >= get_session ('expires_on'))
    {
    	console ('Logout: ' . get_session ('uid'), 1);
        $gGlobal->getApi ()->logout ();        
        return false;
    }

    set_session ('expires_on', time()+INACTIVITY_TIMEOUT);  // User accessed a page : Update his/her session expiration date.
    try {               
        $user = $gGlobal->getApi ()->getUser ();
        //$user = unserialize(get_session ('user_object'));
        return $user;
    }
    catch(Exception $e) {
        return false;
    }   
}
 
function logout ($callback = null)
// Force logout, redirect to login page.
{
    global $bk_root_path;

    $api = new ApiPosting();
    $api->history('ACTION_LOGOUT', 'ACCESS_USER_API');
    $api->logout();

    unset ($_SESSION['uid'], $_SESSION['user_id'], $_SESSION['ip'], $_SESSION['expires_on'], $_SESSION['LOGIN_BACK']);   // Delete server-side session info
    if ($callback != null) $_SESSION['LOGIN_BACK'] = $callback;

    header('Location: index.php?page=connexion');
    
    exit();
}

function register ($callback = null)
{
    global $bk_root_path;

    unset($_SESSION['uid'],$_SESSION['user_id'],$_SESSION['ip'],$_SESSION['expires_on']);   // Delete server-side session info
    if ($callback != null) $_SESSION['LOGIN_BACK'] = $callback;

    header('Location: sources/register.php');
    
    exit();
}

function confirm ($callback = null)
{
    global $bk_root_path;

    unset($_SESSION['uid'],$_SESSION['user_id'],$_SESSION['ip'],$_SESSION['expires_on']);   // Delete server-side session info
    if ($callback != null) $_SESSION['LOGIN_BACK'] = $callback;

    header('Location: sources/confirm.php');
    
    exit();
}

/**
* Confirmation inscription 
*/
function confirm_code ($code)
{
    global $bk_sql_connect;
    global $bk_root_path;

    $api = new ApiPosting;

    $result = $api->getClientToken ('maison-des-seniors', 'c69a4bb2-1107-c77a-8a0a-f45aedc7fd6e');
    if ($result['code'] != 200)
    {
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=api-post-connexion');
        exit;
    }

    $values['code'] = $code;
    $result = $api->confirm_code($values);

    if ($result['code'] == 400)
    {
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=code-confirm-missing');
        exit;
    }
    elseif ($result['code'] == 402)
    {
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=code-confirm-unkown');
        exit;
    }
    elseif ($result['code'] == 403)
    {
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=register-code-validated');
        exit;
    }

    return true;            
}

/**
* Confirmation changement mot de passe 
*/
function confirm_password_code ($code)
{
    global $bk_sql_connect;
    global $bk_root_path;

    $code = explode('-', $code);
    $error = '';

    if (count($code) != 2)
    {
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=password-code-invalid');
        exit;
    }

    try {
        $code_confirm = $code[0];
        $user_id = $code[1];

        $api = new ApiPosting;
        $result = $api->getClientToken ('maison-des-seniors', 'c69a4bb2-1107-c77a-8a0a-f45aedc7fd6e');
        if ($result['code'] != 200)
            throw new Exception('api-post-connexion');

        $values['code'] = $code_confirm;
        $values['user_id'] = $user_id;

        $result = $api->password_code ($values);

        if ($result['code'] == 400)
            header('Location: ' . $bk_root_path . 'index.php?page=popup&m=code-confirm-missing');
        elseif ($result['code'] == 402)
            header('Location: ' . $bk_root_path . 'index.php?page=popup&m=user-unkown');
        elseif ($result['code'] == 403)
            header('Location: ' . $bk_root_path . 'index.php?page=popup&m=password-code-already-validated');
        elseif ($result['code'] == 405)
            header('Location: ' . $bk_root_path . 'index.php?page=popup&m=password-code-invalid');
        else
        {
            header('Location: ' . $bk_root_path . 'index.php?page=popup&m=password-code-validated');
        }
        exit;
    }
    catch(Exception $e){
        $error = $e->getMessage();
        header('Location: ' . $bk_root_path . 'index.php?page=popup&m=' . $e->getMessage());
        exit;
    }   
}

?>