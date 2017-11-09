<?php
	
	header('Content-Type: application/json');

	$json = $_POST['products'];

	/* sanity check */
	if (json_decode($json) != null){

		$nome = str_replace('_',' ', $_POST['nome']) . "_" . date("Ymd_His");

		$file = fopen("history/".$nome.".json",'w+');
		fwrite($file, $json);
		fclose($file);

		/* saveing html content of table */
		$file = fopen("history/html_".$nome.".txt",'w+');
		fwrite($file, $_POST["checkboxes"]);
		fclose($file);
		echo "y";

	}else{
		echo "n1";
	}



?>