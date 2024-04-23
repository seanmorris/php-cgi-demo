import PHP from 'php-cgi-wasm/php-cgi-worker-drupal';
import parseResponse from './parseResponse';

const putEnv = (php, key, value) => php.ccall(
	'wasm_sapi_cgi_putenv'
	, 'number'
	, ['string', 'string']
	, [key, value]
);

const breakoutRequest = request => {
	let getPost = Promise.resolve();

	if(request.body)
	{
		getPost = new Promise(accept => {
			const reader   = request.body.getReader();
			const postBody = [];

			const processBody = ({done, value}) => {
				if(value)
				{
					postBody.push([...value].map(x => String.fromCharCode(x)).join(''));
				}

				if(!done)
				{
					return reader.read().then(processBody);
				}

				accept(postBody.join(''));
			};

			return reader.read().then(processBody);
		});
	}

	const url = new URL(request.url);

	return getPost.then(post => ({
		url
		, method: request.method
		, get: url.search ? url.search.substr(1) : ''
		, post: request.method === 'POST' ? post : null
		, contentType: request.method === 'POST'
			? (request.headers.get('Content-Type') ?? 'application/x-www-form-urlencoded')
			: null
	}));
};

const requestTimes = new WeakMap;

export class PhpCgi
{
	rewrite    = path => path;
	processing = null
	docroot    = null;
	php        = null;
	input      = [];
	output     = [];
	error      = [];
	cookies    = new Map;
	count      = 0;

	constructor({docroot, rewrite, cookies, ...args} = {})
	{
		this.docroot = docroot || '';
		this.cookies = cookies || '';
		this.rewrite = rewrite || this.rewrite;
		this.phpArgs = args;

		this.maxRequestAge    = args.maxRequestAge || 0;
		this.staticCacheTime  = args.staticCacheTime || 0;
		this.dynamicCacheTime = args.dynamicCacheTime || 0;

		this.env = {};

		Object.assign(this.env, args.env || {});

		this.refresh();
	}

	async refresh()
	{
		this.php = new PHP({
			stdin: () =>  this.input
				? String(this.input.shift()).charCodeAt(0)
				: null
			, stdout: x => this.output.push(String.fromCharCode(x))
			, persist: [{mountPath:'/persist'}, {mountPath:'/config'}]
			, ...this.phpArgs
		});

		await navigator.locks.request('php-storage', async () => {
			const php = await this.php;
			php.ccall('pib_storage_init',   'number' , [] , []);
			php.ccall('wasm_sapi_cgi_init', 'number' , [] , []);
			await new Promise((accept,reject) => php.FS.syncfs(true, err => {
				if(err) reject(err);
				else    accept();
			}));
		});

		await this.loadInit();
	}

	async request(request)
	{
		requestTimes.set(request, Date.now());

		const {
			url
			, method = 'GET'
			, get
			, post
			, contentType
		} = await breakoutRequest(request);

		const originalPath = url.pathname;

		const rewrite = this.rewrite(url.pathname);

		let scriptName, path;

		if(typeof rewrite === 'object')
		{
			scriptName = rewrite.scriptName;
			path = this.docroot + rewrite.path;
		}
		else
		{
			scriptName = path = this.docroot + path;
		}

		const cache  = await caches.open('static-v1');
		const cached = await cache.match(url);

		// this.maxRequestAge

		if(cached)
		{
			const cacheTime = Number(cached.headers.get('x-php-wasm-cache-time'));

			if(this.staticCacheTime > 0 && this.staticCacheTime < Date.now() - cacheTime)
			{
				return cached;
			}
		}

		const php = await this.php;

		return new Promise(async accept => {

			if(path.substr(-4) !== '.php')
			{
				const aboutPath = php.FS.analyzePath(path);

				// Return static file
				if(aboutPath.exists && php.FS.isFile(aboutPath.object.mode))
				{
					const response = new Response(php.FS.readFile(path, { encoding: 'binary', url }), {});
					response.headers.append('x-php-wasm-cache-time', new Date().getTime());
					cache.put(url, response.clone());
					accept(response);
					return;
				}

				// Rewrite to index
				path = this.docroot + '/index.php';
			}

			await navigator.locks.request('php-storage', async () => {

				if(this.maxRequestAge > 0 && Date.now() - requestTimes.get(request) > this.maxRequestAge)
				{
					return accept(new Response('408: Request Timed Out.', { status: 408 }));
				}

				const docroot = this.docroot;

				this.input  = ['POST', 'PUT', 'PATCH'].includes(method) ? post.split('') : [];
				this.output = [];
				this.error  = [];

				const selfUrl = new URL(globalThis.location);

				// putEnv(php, 'PHP_INI_SCAN_DIR', '/conf');
				putEnv(php, 'SERVER_SOFTWARE', navigator.userAgent);
				putEnv(php, 'REQUEST_METHOD', method);
				putEnv(php, 'REMOTE_ADDR', '127.0.0.1');
				putEnv(php, 'HTTP_HOST', selfUrl.host);
				putEnv(php, 'REQUEST_SCHEME', selfUrl.protocol.substr(0, selfUrl.protocol.length - 0));

				putEnv(php, 'DOCUMENT_ROOT', docroot);
				putEnv(php, 'REQUEST_URI', originalPath);
				putEnv(php, 'SCRIPT_NAME', scriptName);
				putEnv(php, 'SCRIPT_FILENAME', path);
				putEnv(php, 'PATH_TRANSLATED', path);

				putEnv(php, 'QUERY_STRING', get);
				putEnv(php, 'HTTP_COOKIE', [...this.cookies.entries()].map(e => `${e[0]}=${e[1]}`).join(';') );
				putEnv(php, 'REDIRECT_STATUS', '200');
				putEnv(php, 'CONTENT_TYPE', contentType);
				putEnv(php, 'CONTENT_LENGTH', String(this.input.length));

				try
				{
					if(php._main() === 0) // PHP exited with code 0
					{
						await new Promise((accept,reject) => php.FS.syncfs(false, err => {
							if(err) reject(err);
							else    accept();
						}));
					}
				}
				catch (error)
				{
					console.warn(error);
					this.refresh();
					accept(new Response('500: Internal Server Error.', { status: 500 }));
					return;
				}

				++this.count;

				const parsedResponse = parseResponse(this.output.join(''));

				let status = 200;

				for(const [name, value] of Object.entries(parsedResponse.headers))
				{
					if(name === 'Status')
					{
						status = value.substr(0, 3);
					}
				}

				if(parsedResponse.headers['Set-Cookie'])
				{
					const raw = parsedResponse.headers['Set-Cookie'];
					const semi  = raw.indexOf(';');
					const equal = raw.indexOf('=');
					const key   = raw.substr(0, equal);
					const value = raw.substr(1 + equal, semi - equal);

					this.cookies.set(key, value);
				}

				const headers = { "Content-Type": parsedResponse.headers["Content-Type"] };

				if(parsedResponse.headers.Location)
				{
					headers.Location = parsedResponse.headers.Location;
				}

				accept(new Response(parsedResponse.body, { headers, status, url }));
	 		})
		});
	}

	async analyzePath(path)
	{
		const result = (await this.php).FS.analyzePath(path);
		return {...result, object: undefined, parentObject: undefined};
	}

	async readdir(path)
	{
		return (await this.php).FS.readdir(path);
	}

	async readFile(path)
	{
		return (await this.php).FS.readFile(path);
	}

	async mkdir(path)
	{
		const php = (await this.php);
		const result = php.FS.mkdir(path);
		return new Promise(accept => navigator.locks.request('php-storage', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async rmdir(path)
	{
		const php = (await this.php);
		const result = php.FS.rmdir(path);
		return new Promise(accept => navigator.locks.request('php-storage', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async writeFile(path, data, options)
	{
		const php = (await this.php);
		const result = php.FS.writeFile(path, data, options);
		return new Promise(accept => navigator.locks.request('php-storage', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async unlink(path)
	{
		const php = (await this.php);
		const result = php.FS.unlink(path);
		return new Promise(accept => navigator.locks.request('php-storage', () => {
			php.FS.syncfs(false, err => {
				if(err) throw err;
				accept(result);
			});
		}));
	}

	async putEnv(name, value)
	{
		return (await this.php).ccall('wasm_sapi_cgi_putenv', 'number', ['string', 'string'], [name, value]);
	}

	async getSettings()
	{
		return {
			docroot: this.docroot
			, maxRequestAge: this.maxRequestAge
			, staticCacheTime: this.staticCacheTime
			, dynamicCacheTime: this.dynamicCacheTime
		};
	}

	async setSettings({docroot, maxRequestAge, staticCacheTime, dynamicCacheTime})
	{
		this.docroot = docroot ?? this.docroot;
		this.maxRequestAge = maxRequestAge ?? this.maxRequestAge;
		this.staticCacheTime = staticCacheTime ?? this.staticCacheTime;
		this.dynamicCacheTime = dynamicCacheTime ?? this.dynamicCacheTime;
	}

	async getEnvs()
	{
		return {...this.env};
	}

	async setEnvs(env)
	{
		for(const key of Object.keys(this.env))
		{
			this.env[key] = undefined;
		}

		Object.assign(this.env, env);
	}

	async storeInit()
	{
		const settings = await this.getSettings();
		const env = await this.getEnvs();
		this.writeFile('/config/init.json', JSON.stringify({settings, env}), {encoding: 'utf8'});
	}

	async loadInit()
	{
		const initPath = '/config/init.json';
		const php = (await this.php);
		const check = php.FS.analyzePath(initPath);

		if(!check.exists)
		{
			return;
		}

		const initJson = php.FS.readFile(initPath, {encoding: 'utf8'});
		const init = JSON.parse(initJson || {});
		const {settings, env} = init;

		console.log(init);

		this.setSettings(settings);
		this.setEnvs(env);
	}
}
