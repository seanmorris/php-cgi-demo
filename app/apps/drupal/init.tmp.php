<?php // {"autorun":true, "persist":false, "single-expression": false, "render-as": "html"}

$stdErr = fopen('php://stderr', 'w');
$errors = [];

set_error_handler(function(...$args) use($stdErr, &$errors){
	fwrite($stdErr, print_r($args,1));
});

$docroot = '/persist/drupal-7.95';

unlink($docroot);

$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("/preload/drupal-7.95/", FilesystemIterator::SKIP_DOTS));
$fimovesles = [];
foreach($it as $name => $entry)
{
	if(is_dir($name)) continue;
	$fromDir = dirname($name);
	$toDir  = '/persist' . substr($fromDir, 8);
	$filename = basename($name);
	$pDirs = [$pDir = $toDir];
	while($pDir !== dirname($pDir)) $pDirs[] = $pDir = dirname($pDir);
	$pDirs = array_reverse($pDirs);
	foreach($pDirs as $pDir) if(!is_dir($pDir)) mkdir($pDir, 0777);
	unlink($toDir  . '/' . $filename);
	$moves[] = [$filename, $fromDir, $toDir];
}

print count($moves) . PHP_EOL;

foreach($moves as $move)
{
	[$filename, $fromDir, $toDir] = $move;
	print($fromDir . '/' . $filename . ' => ' . $toDir  . '/' . $filename . PHP_EOL);
	file_put_contents($toDir  . '/' . $filename, file_get_contents($fromDir . '/' . $filename));
}

exit;
