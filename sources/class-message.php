<?php
class Messages {
    var $messages;

    function __construct ()
    {
        global $bk_root_path;
        if (file_exists(FILE_MESSAGES))
            $this->messages = json_decode (file_get_contents (FILE_MESSAGES), true);
        else
            $this->messages = null;
    }

    function getMessage ($id, $params = '')
    {
        if ($this->messages == null)
            return Error (E_FATAL,'Fichier message absent');

        foreach ($this->messages as $key => $value) 
        {
            if ($key == $id)
            {
                if ($params != '') {
                    return vsprintf ($value, $params);
                }
                else
                    return $value;
            }
        }
        return 'Message inconnu (' . $id . ')';
    }    
}
?>