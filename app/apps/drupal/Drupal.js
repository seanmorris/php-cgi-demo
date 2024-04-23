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

const incomplete = new Map;

export class Drupal extends Task
{
	static helpText = 'Run Drupal 7';

	title    = 'Drupal 7';
	icon     = '/apps/drupal-16-24bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		this.window.templates['step-1'] = require('./step-1.tmp');
		this.window.templates['step-2'] = require('./step-2.tmp');
		this.window.templates['step-3'] = require('./step-3.tmp');

		this.window.args.minWidth  = `720px`;
		this.window.args.minHeight = `480px`;

		this.window.args.width     = `800px`;
		this.window.args.height    = `640px`;

		this.init = Date.now();

		const Php = require('php-wasm/PhpWebDrupal').PhpWebDrupal;

		this.php = new Php({persist:[{mountPath: '/persist'}, {mountPath:'/config'}]});

		this.window.classes.loading = true;

		this.window.args.content = '';
		this.window.args.installPercent = 0;
		this.window.args.confirm = 0;
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

		this.window.confirmInitFilesystem = event => this.confirmInitFilesystem(event);
		this.window.confirmClearFilesystem = event => this.confirmClearFilesystem(event);
		this.window.confirmRestoreSite = event => this.confirmRestoreSite(event);

		this.window.clearFilesystem = event => this.clearFilesystem(event);
		this.window.startServer     = event => this.startServer(event);
		this.window.openSite        = event => this.openSite(event);
		this.window.backupSite      = event => this.backupSite(event);
		this.window.restoreSite     = event => this.restoreSite(event);
		this.window.backToMenu      = event => this.backToMenu(event);

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

		const msgBus = new Proxy(Object.create(null), {
			get: (target, action, receiver) => {
				console.log({target, action, receiver});
				return (...params)  => this.sendMessage(action, params);
			}
		});

		this.msgBus = msgBus;

		console.log(msgBus, this.msgBus);

		return Bindable.make(this);
	}

	sendMessage(action, params, accept, reject)
	{
		const token = crypto.randomUUID();

		console.log({action, params, accept, token});

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
		this.window.args.confirm = '0';
		this.window.args.step = 'step-2';
		this.window.args.installPercent = 0;
	}

	async confirmInitFilesystem()
	{
		await this.php;

		navigator.locks.request("php-persist", async (lock) => {
			let fileCount, filesInstalled = 0;
			const installTracker = event => {
				if(!fileCount)
				{
					fileCount = parseInt(event.detail);
					return;
				}
				filesInstalled++;
				const installPercent = 100 * filesInstalled / fileCount;
				this.window.onTimeout(installPercent, () => {
					this.window.args.installPercent = installPercent;
					if(installPercent === 100)
					{
						this.window.args.step = 'step-3';
					}
				});

			};
			this.php.addEventListener('output', installTracker);
			this.php.run(require('./init.tmp.php')).then(() => {
				this.php.removeEventListener('output', installTracker);
				reloadPhp();
			});
		});
	}

	clearFilesystem()
	{
		this.window.args.confirm = '0';
		this.window.args.step = 'step-2-clear';
	}

	async confirmClearFilesystem()
	{
		navigator.locks.request("php-persist", async (lock) => {
			const openDb = indexedDB.open("/persist", 21);

			openDb.onsuccess = event => {
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
		});
	}

	startServer()
	{
		Home.instance().run('cgi-worker', ['--start'])
	}

	openSite()
	{
		Home.instance().run('cgi-worker', ['--start'])
		window.open('/php-wasm/drupal/');
	}

	async backupSite()
	{
		await this.php;

		this.window.args.step = 'step-2-backup';

		this.window.args.installPercent = 0;
		this.window.args.errorMessage = '';

		navigator.locks.request("php-persist", async (lock) => {
			let fileCount, filesInstalled = 0;
			const trackProgress = event => {
				if(!fileCount)
				{
					fileCount = parseInt(event.detail);
					return;
				}
				filesInstalled++;
				const installPercent = 100 * filesInstalled / fileCount;
				this.window.onTimeout(installPercent, () => {
					this.window.args.installPercent = installPercent;
				});
			};
			this.php.addEventListener('output', trackProgress);
			this.php.run(require('./backup.tmp.php'))
			.then(() => this.sendMessage('refresh', []))
			.then(() => this.msgBus.readFile('/persist/backup.zip'))
			.then(result => {
				this.php.removeEventListener('output', trackProgress);
				const blob = new Blob([result], {type:'application/zip'})
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.click();
				this.window.args.step = 'step-3';
			}).catch(error => {
				console.log("ERR!");
				console.error(error);
				this.window.args.errorMessage = error.message;
			});
		})
	}

	restoreSite()
	{
		this.window.args.confirm = '0';
		this.window.args.step = 'step-2-restore';
		this.window.args.installPercent = 0;
	}

	confirmRestoreSite()
	{
		const input = document.createElement('input');
		input.type = 'file';

		input.addEventListener('change', () => {
			input.files[0].arrayBuffer().then(zipContents => {
				this.php.addEventListener('output', installTracker);
				navigator.locks.request("php-persist", async (lock) => {
					this.window.args.step = 'step-3-running';
					this.sendMessage('writeFile', ['/persist/restore.zip', new Uint8Array(zipContents)])
					.then(result => this.php.run(require('./restore.tmp.php')))
					.then(result => this.sendMessage('refresh', []))
					.then(() => this.window.args.step = 'step-3');
				});
			});
		});

		input.click();

	}
}
