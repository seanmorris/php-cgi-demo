import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

const reloadPhp = () => {
	navigator
	.serviceWorker
	.getRegistration(`${location.origin}/DrupalWorker.js`)
	.then(registration => {
		const action = 'refresh';
		const params = [];
		const token  = crypto.randomUUID();
		if(registration)
		{
			registration.active.postMessage({action, params, token});
		}
	});
}

const packages = {
	'drupal-7': {
		name:  'Drupal 7',
		file:  '/backups/drupal-7.95.zip',
		path:  'drupal-7.95',
		vHost: 'drupal',
		dir:   'drupal-7.95',
		entry: 'index.php',
	},
	// 'drupal-8': {
	// 	name:  'Drupal 8',
	// 	file:  '/backups/drupal-8.zip',
	// 	path:  'drupal-8',
	// 	vHost: 'drupal-8',
	// 	dir:   'drupal-8/web',
	// },
	// 'codeigniter-3': {
	// 	name:  'CodeIgniter 3',
	// 	file:  '/backups/codeigniter-3.zip',
	// 	path:  'codeigniter-3',
	// 	vHost: 'codeigniter-3',
	// 	dir:   'codeigniter-3',
	// },
	// 'codeigniter-4': {
	// 	name:  'CodeIgniter 4',
	// 	file:  '/backups/codeigniter-4.zip',
	// 	path:  'codeigniter-4',
	// 	vHost: 'codeigniter-4',
	// 	dir:   'codeigniter-4/public',
	// 	entry: 'index.php',
	// },
	// 'cakephp-5': {
	// 	name:  'CakePHP 5',
	// 	file:  '/backups/cakephp-5.zip',
	// 	path:  'cakephp-5',
	// 	vHost: 'cakephp-5',
	// 	dir:   'cakephp-5/webroot',
	// },
	// 'getsimple-3': {
	// 	name:  'GetSimpleCMS 3',
	// 	file:  '/backups/GetSimpleCMS-3.3.16.zip',
	// 	path:  'getsimple-3',
	// 	vHost: 'getsimple-3',
	// 	dir:   'getsimple-3',
	// },
	'laminas-3': {
		name:  'Laminas 3',
		file:  '/backups/laminas-3.zip',
		path:  'laminas-3',
		vHost: 'laminas-3',
		dir:   'laminas-3/public',
		entry: 'index.php',
	},
	'laravel-11': {
		name:  'Laravel 11',
		file:  '/backups/laravel-11.zip',
		path:  'laravel-11',
		vHost: 'laravel-11',
		dir:   'laravel-11/public',
		entry: 'index.php',
	},
	// 'phpLiteAdmin-1': {
	// 	name:  'phpLiteAdmin 1.9',
	// 	file:  '/backups/phpLiteAdmin-1.9.zip',
	// 	path:  'phpLiteAdmin-1',
	// 	vHost: 'phpLiteAdmin-1',
	// 	dir:   'phpLiteAdmin-1',
	// 	entry: 'phpliteadmin.php',
	// },
	// 'symfony-7': {
	// 	name:  'Symfony 7',
	// 	file:  '/backups/symfony-7.zip',
	// 	path:  'symfony-7',
	// 	vHost: 'symfony-7',
	// 	dir:   'symfony-7/public',
	// 	entry: 'index.php',
	// },
	// 'yii-2': {
	// 	name:  'Yii 2',
	// 	file:  '/backups/yii-2.zip',
	// 	path:  'yii-2',
	// 	vHost: 'yii-2',
	// 	dir:   'yii-2/web',
	// 	entry: 'index.php',
	// },
};

const incomplete = new Map;

export class Drupal extends Task
{
	static helpText = 'Install PHP Packages';

	title    = 'PHP Package Installer';
	icon     = '/apps/drupal-16-24bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.templates['step-1'] = require('./step-1.tmp');
		this.window.templates['step-2'] = require('./step-2.tmp');
		this.window.templates['step-3'] = require('./step-3.tmp');
		this.window.templates['step-waiting'] = require('./step-waiting.tmp');
		this.window.templates['step-install-options'] = require('./step-install-options.tmp');

		this.window.args.packages = packages;

		this.window.args.minWidth  = `720px`;
		this.window.args.minHeight = `520px`;

		if(!Home.instance().args.isMobile)
		{
			this.window.args.width  = `800px`;
			this.window.args.height = `640px`;
		}
		else
		{
			this.window.args.width  = `100vw`;
			this.window.args.height = `100vh`;
		}

		this.init = Date.now();

		const Php = require('php-wasm/PhpWeb').PhpWeb;

		this.php = new Php({persist:[{mountPath: '/persist'}, {mountPath:'/config'}]});

		this.window.classes.loading = true;

		this.window.args.content = '';
		this.window.args.installPercent = 0;
		this.window.args.confirm = 0;
		// this.window.args.step = 'step-install-options';
		this.window.args.step = 'step-1';

		this.window.args.bindTo('confirm', v => {
			if(this.window.tags.nextButton)
			{
				this.window.tags.nextButton.node.disabled = v === '0';
				this.window.tags.nextButtonClear.node.disabled = v === '0';
				this.window.tags.nextButtonRestore.node.disabled = v === '0';
			}
		});

		this.php.addEventListener('output', event => {
			// console.log(event.detail);
		});

		this.window.initFilesystem  = event => this.initFilesystem(event);

		this.window.confirmInitFilesystem  = event => this.confirmInitFilesystem(event);
		this.window.confirmClearFilesystem = event => this.confirmClearFilesystem(event);
		this.window.confirmOptions         = event => this.confirmOptions(event);
		this.window.confirmRestoreSite     = event => this.confirmRestoreSite(event);
		this.window.packageSelected = (...args) => this.packageSelected(...args);

		this.window.clearFilesystem = event => this.clearFilesystem(event);
		this.window.startServer     = event => this.startServer(event);
		this.window.openSite        = event => this.openSite(event);
		this.window.backupSite      = event => this.backupSite(event);
		this.window.restoreSite     = event => this.restoreSite(event);
		this.window.backToMenu      = event => this.backToMenu(event);
		this.window.viewAllFiles    = event => this.viewAllFiles(event);
		this.window.viewFiles       = event => this.viewFiles(event);

		this.window.listen(navigator.serviceWorker, 'message', event => {

			if(event.data.re && incomplete.has(event.data.re))
			{
				const callbacks = incomplete.get(event.data.re);

				if(!event.data.error)
				{
					callbacks[0](event.data.result);
				}
				else
				{
					callbacks[1](event.data.error);
				}

				return;
			}
		});

		this.window.args.bindTo('selectedPackage', v => {
			if(!packages[v])
			{
				return;
			}

			const pkg = packages[v];

			this.window.args.installPath   = pkg.path;
			this.window.args.installPrefix = pkg.vHost;
			this.window.args.installZip    = pkg.file;
			this.window.args.installvHostDir = pkg.dir;
			this.window.args.installEntry  = pkg.entry;
		});

		this.window.args.selectedPackage = 'drupal-7';


		return Bindable.make(this);
	}

	sendMessage(action, params, accept, reject)
	{
		const token = crypto.randomUUID();

		// console.log({action, params, accept, token});

		const ret = new Promise((_accept, _reject) => [accept, reject] = [_accept, _reject]);

		incomplete.set(token, [accept, reject]);

		navigator
		.serviceWorker
		.getRegistration(`${location.origin}/DrupalWorker.js`)
		.then(registration => registration.active.postMessage({action, params, token}));

		return ret;
	}

	backToMenu()
	{
		this.window.args.step = 'step-1';
	}

	initFilesystem()
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true);

		this.window.args.confirm = '0';
		this.window.args.step = 'step-install-options';
		this.window.args.installPercent = 0;
	}

	async confirmInitFilesystem()
	{
		this.window.args.message = 'Downloading package...';
		this.window.args.step = 'step-waiting';
		this.window.args.errorMessage = '';

		await this.php;

		this.window.args.installPercent = 0;

		const download = await fetch(this.window.args.installZip);

		const zipContents = await download.arrayBuffer();

		this.window.args.message = 'Waiting for lock...';

		const trackProgress = event => {
			const installPercent = parseFloat(event.detail);
			this.window.onTimeout(
				installPercent * 1000,
				() => this.window.args.installPercent = parseInt(installPercent * 100)
			);
		};

		this.php.addEventListener('output', trackProgress);

		const settings = await this.sendMessage('getSettings');
		const vHostPrefix = '/php-wasm/' + this.window.args.installPrefix;
		const installPath = '/persist/' + this.window.args.installPath;
		const existingvHost = settings.vHosts.find(vHost => vHost.pathPrefix === vHostPrefix);

		console.log(existingvHost);

		if(!existingvHost)
		{
			settings.vHosts.push({
				pathPrefix: vHostPrefix,
				directory:  '/persist/' + this.window.args.installvHostDir,
				entrypoint: this.window.args.installEntry
			});

			console.log(this.window.args.installEntry);
		}
		else
		{
			existingvHost.directory = '/persist/' + this.window.args.installvHostDir;
			existingvHost.entrypoint = this.window.args.installEntry;
		}

		this.window.args.message = 'Unpacking...';

		await this.sendMessage('writeFile', ['/persist/restore.zip', new Uint8Array(zipContents)]);
		await this.sendMessage('setSettings', [settings]);
		await this.sendMessage('storeInit', []);

		await this.sendMessage('writeFile', ['/config/restore-path.tmp', installPath])
		.then(() => this.php.run(require('./init.tmp.php')))
		.then(() => this.php.removeEventListener('output', trackProgress))
		.then(() => this.window.args.message = 'Reloading PHP...')
		.then(() => this.sendMessage('refresh', []))
		.then(() => this.window.args.step = 'step-3');
	}

	clearFilesystem()
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true);

		this.window.args.confirm = '0';
		this.window.args.step = 'step-2-clear';
	}

	async confirmClearFilesystem()
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true);
		this.window.args.errorMessage = '';

		const fileDb = indexedDB.open("/persist", 21);
		const configDb = indexedDB.open("/config", 21);

		const clearDb = openDb => event => {
			const db = openDb.result;
			const transaction = db.transaction(["FILE_DATA"], "readwrite");
			const objectStore = transaction.objectStore("FILE_DATA");
			const objectStoreRequest = objectStore.clear();

			objectStoreRequest.onsuccess = reloadPhp;

			this.window.args.installPercent = 0;

			this.window.onTimeout(100, () => {
				this.window.args.step = 'step-1';
			});
		};

		fileDb.onsuccess = clearDb(fileDb);
		configDb.onsuccess = clearDb(configDb);
	}

	startServer()
	{
		Home.instance().run('cgi-worker', ['--start']);
	}

	openSite()
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true)
		setTimeout(() => window.open('/php-wasm/' + this.window.args.installPrefix), 200);
	}

	viewFiles()
	{
		Home.instance().run('omni-explorer', ['persist/' + this.window.args.installPath])
	}

	viewAllFiles()
	{
		Home.instance().run('omni-explorer', ['persist'])
	}

	async backupSite(event)
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true);
		await this.php;

		this.window.args.step = 'step-2-backup';

		this.window.args.installPercent = 0;
		this.window.args.errorMessage = '';

		const trackProgress = event => {
			const installPercent = parseFloat(event.detail);
			this.window.args.installPercent = 100 * installPercent;
		};

		this.php.addEventListener('output', trackProgress);

		await this.php.run(require('./backup.tmp.php'))
		.then(() => this.sendMessage('refresh', []))
		.then(() => this.sendMessage('readFile', ['/persist/backup.zip']))
		.then(result => {
			this.php.removeEventListener('output', trackProgress);
			const blob = new Blob([result], {type:'application/zip'})
			const link = event.view.document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.click();
			this.window.args.step = 'step-1';
		})
		.then(() => this.sendMessage('unlink', ['/persist/backup.zip']))
		.catch(error => {
			console.log("ERR!");
			console.error(error);
			this.window.args.errorMessage = error.message;
		});
	}

	restoreSite()
	{
		this.window.args.confirm = '0';
		this.window.args.step = 'step-2-restore';
		this.window.args.installPercent = 0;
	}

	confirmRestoreSite(event)
	{
		Home.instance().run('cgi-worker', ['--start-quiet'], true);
		const input = event.view.document.createElement('input');
		input.type = 'file';

		input.addEventListener('change', () => {
			input.files[0].arrayBuffer().then(zipContents => {
				this.window.args.step = 'step-waiting';
				this.sendMessage('writeFile', ['/persist/restore.zip', new Uint8Array(zipContents)])
				.then(result => this.php.run(require('./restore.tmp.php')))
				.then(result => this.sendMessage('refresh', []))
				.then(() => this.window.args.step = 'step-3');
			});
		});

		input.click();
	}

	confirmOptions()
	{
		this.window.args.confirm = '0';
		this.window.args.step = 'step-2';
		this.window.args.installPercent = 0;
	}

	packageSelected(event)
	{
		this.window.args.selectedPackage = event.target.value;
	}
}
