<?php // {"autorun":true, "persist":false, "single-expression": false, "render-as": "html"}

$stdErr = fopen('php://stderr', 'w');

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, print_r($args,1));
});

$docroot = '/persist';
$configroot = '/config';

$files = [];
$itA  = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($docroot, FilesystemIterator::SKIP_DOTS));
$itB  = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($configroot, FilesystemIterator::SKIP_DOTS));
$zip = new \ZipArchive;

if($zip->open('/persist/backup.zip', ZipArchive::CREATE) === TRUE)
{
	foreach ($itA as $name => $entry)
	{
		if(is_dir($name)) continue;

		$files[] = $name;
	}
}

	foreach ($itB as $name => $entry)
	{
		if(is_dir($name)) continue;

		$files[] = $name;
	}

print count($files) . PHP_EOL;

foreach($files as $name)
{
	$zip->addFile($name);
	var_dump($name);
}

var_dump($zip->close());

exit;


