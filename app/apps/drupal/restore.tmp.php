<?php // {"autorun":true, "persist":false, "single-expression": false, "render-as": "html"}
// ini_set('session.save_path', '/persist');

$stdErr = fopen('php://stderr', 'w');

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, print_r($args,1));
});

$docroot = '/persist/drupal-7.95';

unlink($docroot);

$zip = new ZipArchive;

if($zip->open('/persist/restore.zip', ZipArchive::RDONLY) === TRUE)
{
	$zip->extractTo('/');
}

var_dump($zip->close());

unlink('/persist/restore.zip');

exit;


