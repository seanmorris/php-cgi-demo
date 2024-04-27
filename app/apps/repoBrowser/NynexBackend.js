import { Router } from "curvature/base/Router";
import { Folder as Resource } from "./Folder";
// import { GitHub } from "../gitHub/GitHub";

const incomplete = new Map;

navigator.serviceWorker.addEventListener('message', event => {

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
	}
});

const sendMessage = (action, params, accept, reject) => {
	const token = crypto.randomUUID();

	// console.log({action, params, accept, token});

	const ret = new Promise((_accept, _reject) => [accept, reject] = [_accept, _reject]);

	incomplete.set(token, [accept, reject]);

	navigator
	.serviceWorker
	.getRegistration(`${location.origin}/DrupalWorker.js`)
	.then(registration => registration.active.postMessage({action, params, token}));

	return ret;
};

const msgBus = new Proxy(Object.create(null), {
	get: (target, action, receiver) => (...params)  => sendMessage(action, params)
});

export class IdbfsBackend
{
	populate({uri, folder, pathOpen, browser})
	{
		return msgBus.stat(uri).then(stat => {
			if(16384 & stat.mode)
			{
				return msgBus.readdir(uri).then(async files => {

					const result = [];

					files = await Promise.all(files.map(async file => {
						const path = uri + (uri.length > 1 ? '/' : '') + file;
						const info = await msgBus.analyzePath(path);
						const stat = await msgBus.stat(path);
						return {name: file
							, path, stat
							, info, mode: stat.mode.toString(8)
							, type: (16384 & stat.mode ? 'dir' : 'file')
						};
					}));

					files.sort((a, b) => {

						if(a.type !== 'dir' && b.type !== 'dir')
						{
							return 0;
						}

						if(a.type !== 'dir')
						{
							return 1;
						}

						if(b.type !== 'dir')
						{
							return -1;
						}
					});

					files.map((file, key) => {

						if(file.name === '.' || file.name === '..')
						{
							return;
						}

						const name = file.name;
						const img  = file.type === 'dir'
							? '/w95/4-16-4bit.png'
							: '/w95/60-16-4bit.png';

						const resource = new Resource({
							browser
							, backend: this
							, url: uri + (uri.length > 1 ? '/' : '') + file.name
							, icon: img
							, name
							, file
							, pathOpen
						}, folder);

						folder.files[name] = resource;

						result.push(resource);

						folder.onTimeout(key * 2, () => folder.args.files.push(resource));
					});

					return new Promise(accept => {
						// folder.onTimeout(files.length*20, () => accept(files));
						accept(files);
					});
				});
			}
			else
			{
				// const file = files;
				// browser.window.args.download = file.download_url;
			}

		});
	}

	displayFile({file, dir, browser})
	{
		if(file.type === 'file')
		{
			browser.window.args.content  = '';
			browser.window.args.url      = '';
			browser.window.args.filename = '';
			msgBus.readFile(file.path).then(content => {
				content = new TextDecoder().decode(content);
				// content = decodeURIComponent(escape(atob(content)));
				browser.window.args.content = content;
				browser.window.args.filename = file.name;
				console.log(browser.window.args.content);
			});
		}
		else
		{
			console.log({file, dir, browser});

			browser.window.args.filename = file.name;
			browser.parent               = dir;
			browser.window.args.content  = null;
		}

		return;
	}

	loadFile({uri, browser, filepath})
	{
	}

	saveFile()
	{
	}
}
