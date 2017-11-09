<?php

	header('Content-Type: application/json');
	
	if($_POST['type']=="readlist"){
		$list = "";

		if ($handle = opendir('history')) {
            $files_array = array();
		    while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != ".." && strtolower(substr($file, strrpos($file, '.') + 1)) == 'json') {
                    $file_info = explode('_', substr($file, 0, strpos($file,".")) );

                    $files_array[$file_info[1] . $file_info[2]] = array(
                        'name' => $file_info[0],
                        'date' => $file_info[1],
                        'time' => $file_info[2],
                        'real_name' => $file
                    );
                }
		    }
            closedir($handle);

            // sort
            krsort($files_array);

		    foreach ( $files_array as $file ) {
                $list .= '<tr><td><button class="btn" data-file-name="' . $file['real_name'] .'">'.$file['name']
                    . ' <span style="color:#6f6f6f; font-size: .8rem;">(' . date('d/m/y H:i:s',strtotime($file['date'] . $file['time'])) . ')</span></button></td></tr>';
            }

		}

		echo $list;
	}else if($_POST['type']=="loadF"){

		$str = file_get_contents("history/".$_POST["filename"]);
		echo $str;

	}else if($_POST['type']=="delete"){
	    $file_name = $_POST['filename'];

	    $html_file_name = 'html_' . substr($file_name, 0, strpos($file_name,".")) . '.txt';

		if(unlink("history/".$_POST['filename']) && unlink("history/".$html_file_name)){
			echo "y";
		}else{
			echo "n";
		}

		
	}else if($_POST['type']=="html"){

		$newName = substr($_POST["filename"], 0, strpos($_POST["filename"],"."));
		$str = file_get_contents("history/html_".$newName.".txt");
		echo $str;
		
	}

?>