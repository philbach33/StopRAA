<?php
	/**
	 * Class Profile
	 */
	class User 
	{
		public const RELATIVE_PATH = 'RELATIVE_PATH';
		public const ABSOLUTE_PATH = 'ABSOLUTE_PATH';
		public const ROLE_GUEST = 'GUEST';
		public const ROLE_USER = 'USER';
		public const ROLE_GROUP = 'GROUP';
		public const ROLE_CITY = 'CITY';
		public const ROLE_ADMIN = 'ADMIN';
		public const ROLE_SUPERADMIN = 'SADMIN';
		public const USER_GUEST = -1;
		public const AUTH_PRIVATE = 'PRIVATE';
		public const AUTH_PUBLIC = 'PUBLIC';

	    /**
	    * @base unknown
	    */
		var $id;

		var $email;
		var $confirm_code;
		var $pwd;
		/**
	    * @base unknown
	    */
		var $contact;
		/**
	    * @base unknown
	    */		
		var $username;
		var $avatar;
		var $gender;
		var $firstname;
		var $lastname;
		var $pwd_code;
		var $attempts;
		var $group_id;
		var $phone;
		var $phone_code;
		var $address;
		var $zipcode;
		var $city;
		var $status;
		var $roles;
		var $created_at;
		var $peering;
		var $path;
		var $pupitre;
		var $function_name;
		var $function_id;
		var $authorisation;

		/**
	    * @base unknown
	    */
	    var $phones;
		
		/**
	    * @base unknown
	    */	 
		var $group;

		/**
	    * @base unknown
	    */	    
	    var $datas;

		function __construct ($profil = null, $by = 'BY_ID')
		{			
			global $gGlobal;

			if ($profil == null) 
			{
				$this->setId (-1);
				$this->setFirstname ('visiteur');
				$this->setLastname ('');
				$this->setStatus (GUEST);
				$this->setRoles (USER::ROLE_GUEST);
				$this->setGroupId ($gGlobal->getConfiguration ('DEFAULT_GROUP'));	
				$this->setFunctionId (0);
				return $this;
			}

			if ($by == 'BY_ROW' && isset($profil['row']))
			{
				$row = $profil['row'];
		        foreach ($row as $key => $value) {
		            $this->$key = $value;
		        }
			}
			else
			{
				if ($by == 'BY_ID' && isset($profil['id']))
				{
					$result = $gGlobal->getApi ()->get_users(['user_id' => $profil['id']]);
					
					if ($result['code'] != 200)
						throw new Exception('sql-error');
					elseif ($result['datas'] == null)
						throw new Exception('user-unknown');
					else
					{
						$row = $result['datas'][0];
				        foreach ($row as $key => $value) {
				            $this->$key = $value;
				        }
					}
				}
				elseif ($by == 'BY_EMAIL' && isset($profil['email']))
				{
					$this->email = $profil['email'];
					$where = 'email="' . $this->email . '"';
				}
				else
					throw new Exception('params-error');
			}

			$this->contact = null;
		}

		function read ($value)
		{
			global $gGlobal;

			if (strpos($value, '@') === false)
			{
				// By ID				
				$result = $gGlobal->getApi ()->get_users(['user_id' => $value]);
				
				if ($result['code'] != 200)
					throw new Exception($gGlobal->getMessage ('unkown-error') . ': ' . $result['message']);
				elseif ($result['datas'] == null)
					throw new Exception($gGlobal->getMessage ('user-unknown'));
				else
				{
					$row = $result['datas'][0];
			        foreach ($row as $key => $value) {
			            $this->$key = $value;
			        }
					$group = new Group ();
					$group->read ($this->getGroupId ());
					$this->setGroup ($group);
				}
			}
		}

		function getId ()
		{
			return $this->id;
		}

		function setId ($value)
		{
			$this->id = $value;
		}

		function getAvatar ($path = User::ABSOLUTE_PATH)
		{
			global $gGlobal;

			$default_avatar = 'assets/images/profil-m.jpg';

			if ($this->avatar == null)
				return $default_avatar;
			elseif ($path == User::RELATIVE_PATH)
				return $gGlobal->getConfiguration("path_avatars") . $this->avatar;
			else
			{
				$avatar = new Photo ();
				$avatar->read ($this->avatar);
				if (!file_exists($avatar->getLocalPath ()))
					return $default_avatar;
				else
					return $avatar->getPath ();
			}
		}

		function getEmail ()
		{
			return $this->email;
		}

		function setEmail ($value)
		{
			$this->email = $value;
		}

		function getGender ()
		{
			return $this->gender;
		}

		function getAuthorisation ()
		{
			return $this->authorisation;
		}

		function isPrivateAuthorisation ()
		{
			return $this->authorisation == User::AUTH_PRIVATE;
		}

		function setAuthorisation ($value = User::AUTH_PUBLIC)
		{
			$this->authorisation = $value;
		}

		function getConfirmCode ()
		{
			return $this->confirm_code;
		}

		function createConfirmCode ()
		{
			$this->confirm_code = unique_id ();
		}

		function getPupitre ()
		{
			$datas = json_decode ($this->datas);
			return $datas->pupitre;
		}

		function getPupitreLabel ()
		{
			global $gGlobal;
			$pupitre = $this->getPupitre ();
			
			if ($pupitre != null)
				return $gGlobal->getMessage ($pupitre);
			else
				return '-';
		}

		function setPupitre ($value)
		{
			$datas = json_decode ($this->datas);
			$datas->pupitre = $value;
			$this->datas = json_encode ($datas);
		}

		function getPassword ()
		{
			return $this->pwd;
		}

		function getPasswordCode ()
		{
			return $this->pwd_code;
		}

		function getUsername ()
		{
			return ucfirst($this->firstname) . ' ' . ucfirst($this->lastname);
		}		

		function getFirstname ()
		{
			return $this->firstname;
		}		

		function setFirstname ($value)
		{
			$this->firstname = $value;
		}		

		function getLastname ()
		{
			return $this->lastname;
		}		

		function setLastname ($value)
		{
			$this->lastname = $value;
		}		

		function getStatus ()
		{
			return $this->status;
		}
	
		function setStatus ($value)
		{
			$this->status = $value;
		}

		function getStatusLabel ()
		{
			global $gGlobal;

			switch ($this->status)
			{
		        case STEP_EMAIL:
		        	return $gGlobal->getMessage ('step-email');

		        case STEP_ADDRESS:  
		        	return $gGlobal->getMessage ('step-address');
		        
		        case STEP_PHONE:
		        	return $gGlobal->getMessage ('step-phone');

		        case STEP_CODE:
		        	return $gGlobal->getMessage ('step-code-phone');

		        case STEP_ADMIN:
		        	return $gGlobal->getMessage ('step-admin');

		        case DISABLED:			
					return $gGlobal->getMessage ('step-disabled-user');

		        case ENABLED:			
					return "actif";
			}
		}

		function getRoles ()
		{
			return $this->roles;
		}

		function setRoles ($value)
		{
			$this->roles = $value;
		}

		function isGroupRole()
		{
			if ($this->roles == USER::ROLE_GROUP)
				return true;
			else 
				return false;
		}

		function isUserRole()
		{
			if ($this->roles == USER::ROLE_USER)
				return true;
			else 
				return false;
		}


		function isGuest()
		{
			if ($this->roles == USER::ROLE_GUEST)
				return true;
			else 
				return false;
		}

		function isSuperAdminRole()
		{
			if ($this->roles == USER::ROLE_SUPERADMIN)
				return true;
			else 
				return false;
		}

		function isAdminRole()
		{
			if ($this->roles == USER::ROLE_ADMIN)
				return true;
			else 
				return false;
		}

		function getGroupId ()
		{
			global $gGlobal;
			
			if ($this->isSuperAdminRole ())
				return $gGlobal->getConfiguration ('DEFAULT_GROUP');
			else
				return $this->group_id;
		}

		function setGroupId ($value)
		{
			$this->group_id = $value;
		}

		function getGroup ()
		{
			if ($this->group != null)
				return $this->group;
			return false;
		}

		function setGroup ($value)
		{
			$this->group = $value;
		}

		function getPath ()
		{
			return $this->path;
		}

		function setPath ($value)
		{
			$this->path = $value;
		}

		function getPhone ()
		{
			return $this->phone;
		}

		function getPhoneCode ()
		{
			return $this->phone_code;
		}

		function getFunctionId ()
		{
			return $this->function_id;
		}

		function getFunctionName ()
		{
			return empty($this->function_name)?'&nbsp':$this->function_name;
		}

		function setFunctionId ($value)
		{
			$this->function_id = $value;
		}

		function setFunctionName ($value)
		{
			$this->function_name = $value;
		}

		function getCityName ()
		{
			return $this->city;
		}

		function getCreatedAt ()
		{
			return $this->created_at;
		}

		function getZipcode ()
		{
			return $this->zipcode;
		}

		function getAddress ()
		{
			return $this->address;
		}

		function getAttempts()
		{
			return $this->attempts;
		}

		function setPasswordCode ($code)
		{
			$this->pwd_code = $code;
		}


		function setPassword ($code)
		{
			$this->pwd = md5($code);
		}

		function updateAttempts()
		{
			$this->attempts++;
			$this->push();
			return $this->attempts;
		}

		function setAttempts($value)
		{
			$this->attempts = intval ($value);
		}

		function push ()
		{
			$re = '/.*@base\s(.*)\s.*/m';

			foreach (get_object_vars($this) as $prop_name => $prop_value) 
			{
				$class = new ReflectionProperty('User', $prop_name);
				preg_match_all($re, $class->getDocComment(), $matches, PREG_SET_ORDER, 0);	
				if (count($matches) != 1)
				{
					if ($prop_value !== 0 && empty($prop_value))
					{
						$prop_value = null;
					}
					$rows[$prop_name] = $prop_value;
				}
			}			
			sql_update (TABLE_USERS, $rows, 'id='.$this->id);
		}
	}
?>