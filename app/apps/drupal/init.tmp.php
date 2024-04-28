<?php // {"autorun":true, "persist":false, "single-expression": false, "render-as": "html"}

$stdErr = fopen('php://stderr', 'w');

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, print_r($args,1));
});

$pathFile = '/config/restore-path.tmp';
$docroot = file_get_contents($pathFile);

unlink($docroot);
unlink($pathFile);

mkdir($docroot, 0777, true);

$zip = new ZipArchive;

if($zip->open('/persist/restore.zip', ZipArchive::RDONLY) === TRUE)
{
	$total = $zip->count();
	for($i = 0; $i < $total; $i++)
	{
		$zip->extractTo($docroot, $zip->getNameIndex($i));
		print ((1+$i) / $total) . PHP_EOL;
	}
}

unlink('/persist/restore.zip');

exit;


