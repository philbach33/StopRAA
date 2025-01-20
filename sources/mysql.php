<?php
	define ("NO_DATA", -1);
	
	$bk_sql_connect = null;

	function sql_connect ($server, $base, $user, $pwd)
	{
		global $bk_sql_connect;

		if ($bk_sql_connect != null) return true;

//		if (isset ($_SERVER["SERVER_NAME"]) && $_SERVER["SERVER_NAME"] == "localhost")
//			$bk_sql_connect = mysqli_connect ("p:localhost", "root", "");
//		else
		$bk_sql_connect = mysqli_connect ($server, $user, $pwd);

		if (!$bk_sql_connect)
		{
			return false;
		}	
	
		if  (mysqli_select_db ($bk_sql_connect, $base) == false)
		{
			return false;
		}

		mysqli_query ($bk_sql_connect, "set names 'utf8'");

		return true;
	}

	function sql_autocommit ()
	{	
		global $bk_sql_connect;
		mysqli_autocommit ($bk_sql_connect, FALSE);
	}

	function sql_commit ()
	{	
		global $bk_sql_connect;
		mysqli_commit ($bk_sql_connect);
		mysqli_autocommit ($bk_sql_connect, TRUE);
	}

	function sql_rollback ()
	{	
		global $bk_sql_connect;
		mysqli_rollback ($bk_sql_connect);
		mysqli_autocommit ($bk_sql_connect, TRUE);
	}

	function sql_function ($proc_name, $params)
	{ 
		global $bk_sql_connect;

	  	$ds = array(); 
	  	if ($result = mysqli_query ($bk_sql_connect, "CALL $proc_name('" . implode("', '", $params) . "');")) 
	  	{ 
	    	if ($result !== false)
	    	{ 	  		
		        while ($row = mysqli_fetch_array ($result, MYSQLI_ASSOC))
		        { 
		           $ds[] = $row; 
		        } 
	        	mysqli_free_result ($result);
	     	}
	     	mysqli_next_result ($bk_sql_connect);
	  	} 
	  	mysqli_commit ($bk_sql_connect); 
	  	return $ds; 
	} 

	function sql_insert ($table, $values)
	{	
		global $bk_sql_connect;

		$sql = "insert into $table (";
		foreach ($values as $name => $value)
			$sql .= $name . ",";

		$sql = substr ($sql, 0, strlen ($sql)-1);
		$sql .= ") values (";

		foreach ($values as $name => $value)
		{
			if (is_string($value) || empty($value))
				$sql .= "'" . addslashes ($value) . "',";
			else
				$sql .= $value . ",";
		}
		$sql = substr ($sql, 0, strlen ($sql)-1);
		$sql .= ")";

		$result = mysqli_query ($bk_sql_connect, $sql);
		if ($result == false)
		{
			Error (E_SQL, $sql);
		}
		else
		{
			return true;
		}
	}

	function sql_insert_multiple ($table, $fields, $values)
	{	
		global $bk_sql_connect;

		$sql = "insert into $table (";
		foreach ($fields as $value)
			$sql .= $value . ",";

		$sql = substr ($sql, 0, strlen ($sql)-1) . ") values ";
		foreach ($values as $arr)
		{
			$sql .= '(';
			foreach ($arr as $value)
			{
				if (is_string($value) || empty($value))
					$sql .= "'" . addslashes ($value) . "',";
			}
			$sql = substr ($sql, 0, strlen ($sql)-1) . '),';
		}
		$sql = substr ($sql, 0, strlen ($sql)-1);

		$result = mysqli_query ($bk_sql_connect, $sql);
		if ($result == false)
			Error (E_SQL, $sql);
		else
			return true;
	}


	function sql_last_insert_id ()
	{	
		global $bk_sql_connect;

		return mysqli_insert_id ($bk_sql_connect);
	}

	function sql_update ($table, $values, $where = "")
	{
		global $bk_sql_connect;

		$sql = "update $table set ";
		foreach ($values as $name => $value)
		{
//			if (isset ($value) && $value != '' || is_numeric ($value))
			if (is_string($value) || empty($value))
				$sql .= $name . "='" . addslashes ($value) . "',";
			elseif (is_null($value))
				$sql .= "{$name}=null,";				
			else
				$sql .= "{$name}={$value},";
		}
		$sql = substr ($sql, 0, strlen ($sql)-1);
		if ($where != "")
			$sql .= " where " . $where;

		$result = mysqli_query ($bk_sql_connect, $sql);		
		if ($result == false)
		{
			Error (E_SQL, $sql);
			return false;
		}
		else
			return true;
	}

	function sql_count ($table, $where = "")
	{
		global $bk_sql_connect;

		if ($where != "")
			$sql = "select * from " . $table . " where " . $where;
		else
			$sql = "select * from " . $table;
		$result = mysqli_query ($bk_sql_connect, $sql);
		if ($result == false)
		{
			return false;
		}

		return mysqli_num_rows ($result);
	}

	/*
	* DELETE
	*/
	function sql_delete ($table, $where = "")
	{
		global $bk_sql_connect;

		if (empty($where))
			$sql = "delete from " . $table;
		else
			$sql = "delete from " . $table . " where " . $where;

		$result = mysqli_query($bk_sql_connect, $sql);
		if ($result == false)
		{
			return false;
		}
		else
			return true;
	}

	function sql_execute ($sql)
	{
		global $bk_sql_connect;

		$result = mysqli_query($bk_sql_connect, $sql);
		if ($result == false)
		{
			return false;
		}

        $i =0;
		while ($row = mysqli_fetch_array ($result, MYSQLI_ASSOC)) 
		{
			$arrrs[$i] = $row;
			++$i;
		}

        mysqli_free_result($result);
        if (!isset ($arrrs)) return NO_DATA;
        return $arrrs;					
	}

	/*
	* SELECT
	*/
	function _sql_select ($table, $where = "", $object = "", $order = "", $count = 0)
	{
		global $bk_sql_connect;
		global $gGlobal;

		if (empty($where))
			$sql = "select * from " . $table;
		else
			$sql = "select * from " . $table . " where " . $where;
		
		if (!empty($order))
			$sql .= " order by " . $order;
		
		if ($count != 0)
			$sql .= " limit " . $count;

		$result = mysqli_query ($bk_sql_connect, $sql);
		if ($result == false)
		{
			$msg = $gGlobal->getMessage ('error_sql', sql_error () . ', ' . $sql);
			throw new Exception ($msg, 500);
//			Error (E_SQL, $sql);
		}

        $i =0;
        if ( $object == "")
        {
			while ($row = mysqli_fetch_array ($result, MYSQLI_ASSOC)) 
			{
				$arrrs[$i] = $row;
				++$i;
			}
		}
		else
			while ($row = mysqli_fetch_object ($result, MYSQLI_ASSOC)) 
			{
				$arrrs[$i] = $row;
				++$i;
			}
			
        mysqli_free_result($result);
        if (!isset ($arrrs)) return NO_DATA;
        return $arrrs;	
	}

	/*
	* SELECT
	*/
	function sql_select_distinct ($table, $field, $where = "", $order = "")
	{
		global $bk_sql_connect;

		if (empty($where))
			$sql = "select distinct {$field} from " . $table;
		else
			$sql = "select distinct {$field} from " . $table . " where " . $where;
		
		if (!empty($order))
			$sql .= " order by " . $order;

		$result = mysqli_query($bk_sql_connect, $sql);
		if ($result == false)
		{
			Error (E_SQL, $sql);
		}

        $i =0;
		while ($row = mysqli_fetch_array ($result,MYSQLI_ASSOC)) 
		{
			$arrrs[$i] = $row;
			++$i;
		}
			
        mysqli_free_result($result);
        if (!isset ($arrrs)) return NO_DATA;
        return $arrrs;	
	}

	function sql_select_order ($table, $where = "", $order = "", $count = 0)
	{
		return _sql_select ($table, $where, "", $order, $count);
	}

	function sql_select ($table, $where = "")
	{
		return _sql_select ($table, $where);
	}

	function sql_select_object ($table, $where = "")
	{
		return _sql_select ($table, $where, "mysqli_fetch_object");
	}
			

	/* 
	* Copy to object
	*/		
	function sql_copy_to_object ($object, $row) 
	{
		foreach ($row as $var => $value)
		{
			$var = strtolower($var);
			$object->$var = $value;
		}
	}

	function sql_error ()
	{
		global $bk_sql_connect;
		return mysqli_error	($bk_sql_connect);
	}


	function sql_where (&$sql) 
	{
		$sql .= ' WHERE ';
	}
	
	function sql_and_where (&$where, $and) 
	{
		if ($where != '')
			$where .= ' AND ' . $and;	
		else
			$where = ' ' . $and;
	}

	function sql_or_where (&$where, $or) 
	{
		if ($where != '')
			$where .= ' OR ' . $or;	
		else
			$where = ' ' . $or;
	}

	function sql_order_by_desc ($order) 
	{
		return ' ORDER BY ' . $order . ' DESC ';
	}

	function sql_order_by_asc ($order) 
	{
		return ' ORDER BY ' . $order . ' DESC ';
	}
?>
