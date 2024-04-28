import { PhpCgi } from "./PhpCgi";

const php = new PhpCgi({
	prefix: '/php-wasm'
	, docroot: '/persist/www'
	, types: {
		jpeg: 'image/jpeg'
		, jpg: 'image/jpeg'
		, gif: 'image/gif'
		, png: 'image/png'
		, svg: 'image/svg+xml'
	}
});

self.addEventListener('install', event => {
	console.log('Install');
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	console.log('Activate');
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => event.respondWith(new Promise(accept => {
	const url     = new URL(event.request.url);
	const prefix  = php.prefix;
	const request = event.request;

	if(url.pathname.substr(0, prefix.length) === prefix && url.hostname === self.location.hostname)
	{
		return php.request(request).then(response => {

			const logLine = `[${(new Date).toISOString()}] #${php.count} 127.0.0.1 - "${request.method} ${url.pathname}" - HTTP/1.1 ${response.status}`;

			clients.matchAll({includeUncontrolled: true}).then(clients => {
				clients.forEach(client => client.postMessage({
					action: 'logRequest',
					params: [logLine, {status: response.status}],
				}))
			});

			accept(response);

		});
	}

	const _path = url.pathname.split('/').slice(1);

	if(_path[0] === 'php-wasm')
	{
		_path.shift();
	}

	accept(fetch(request));
})));

self.addEventListener('message', async event => {
	const { data, source } = event;
	const { action, token, params = [] } = data;

	switch(action)
	{
		case 'analyzePath':
		case 'readdir':
		case 'readFile':
		case 'stat':
		case 'mkdir':
		case 'rmdir':
		case 'writeFile':
		case 'rename':
		case 'unlink':
		case 'putEnv':
		case 'refresh':
		case 'getSettings':
		case 'setSettings':
		case 'getEnvs':
		case 'setEnvs':
		case 'storeInit':
			let result, error;
			try
			{
				result = await php[action](...params);
			}
			catch(_error)
			{
				error = JSON.parse(JSON.stringify(_error));
				console.warn(_error);
			}
			finally
			{
				source.postMessage({re: token, result, error});
			}

		break;
	}
});

self.addEventListener('push', event => {
	console.log(event);
});
