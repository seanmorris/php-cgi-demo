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
			if(!(16384 & stat.mode))
			{
				return;
			}

			return msgBus.readdir(uri).then(async files => {

				const result = [];

				files = await Promise.all(files.map(async file => {
					const path = uri + (uri.length > 1 ? '/' : '') + file;
					const info = await msgBus.analyzePath(path);
					const stat = await msgBus.stat(path);
					return {name: file
						, path: path.substr(1)
						, stat
						, info, mode: stat.mode.toString(8)
						, type: (16384 & stat.mode
								? 'dir'
								: (file.indexOf('.') > 0 ? file.split('.').pop() : 'file')
						)
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

					let iconOpen = '/w95/5-16-4bit.png';
					let iconClosed = '/w95/4-16-4bit.png';

					const icons = {
						'dir': '/w95/4-16-4bit.png'
						, '*': '/w95/60-16-4bit.png'
					}

					const name = file.name;
					let img = icons[file.type] ?? icons['*'];

					if(file.info.path === file.info.object.mount.mountpoint)
					{
						iconOpen = iconClosed = img = '/w95/9-16-4bit.png'
					}

					if(file.info.isRoot)
					{
						iconOpen = iconClosed = img = '/w95/16-16-4bit.png'
					}

					const resource = new Resource({
						browser
						, backend: this
						, url: uri + (uri.length > 1 ? '/' : '') + file.name
						, icon: img
						, iconOpen
						, iconClosed
						, name
						, file
						, pathOpen
					}, folder);

					folder.files[name] = resource;

					result.push(resource);

					folder.onTimeout(key * 2, () => folder.args.files.push(resource));
				});

				return new Promise(accept => {
					// folder.onTimeout(files.length * 16, () => accept(files));
					accept(files);
				});
			});

		});
	}

	displayFile({file, dir, browser})
	{
		if(file.type !== 'dir')
		{
			browser.window.args.content  = '';
			browser.window.args.url      = '';
			browser.window.args.filename = '';
			Router.go(`/${browser.cmd}/${file.path}`, 2);
			return msgBus.readFile('/' + file.path).then(content => {
				content = new TextDecoder().decode(content);
				// content = decodeURIComponent(escape(atob(content)));
				browser.window.args.content = content;
				browser.window.args.filename = file.name;
				browser.window.args.filepath = '/' + file.path;
			});
		}
		else
		{
			browser.window.args.filename = file.name;
			browser.window.args.filepath = '/' + file.path;
			browser.parent               = dir;
			browser.window.args.content  = null;

			return Promise.resolve();
		}
	}

	loadFile({uri, browser, filepath})
	{
	}

	mkdir({path})
	{
		return msgBus.mkdir(path);
	}

	saveFile({browser})
	{
		const content = browser.window.args.plain.args.content;
		const path = browser.window.args.filepath;
		return msgBus.writeFile(path, content);
	}

	readFile({path})
	{
		return msgBus.readFile(path);
	}

	writeFile({path,content})
	{
		return msgBus.writeFile(path, content);
	}

	renameFile({newName, oldName})
	{
		console.log(oldName, newName);
		return msgBus.rename(oldName, newName);
	}

	deleteFolder({path})
	{
		return msgBus.rmdir(path);
	}

	deleteFile({path})
	{
		return msgBus.unlink(path);
	}
}
