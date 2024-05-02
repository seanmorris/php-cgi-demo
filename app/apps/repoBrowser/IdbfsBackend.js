import { Router } from "curvature/base/Router";
import { Folder as Resource } from "./Folder";
import { msgBus } from "../../msgBus";

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

	async displayFile({file, dir, browser})
	{
		if(file.type !== 'dir')
		{
			browser.window.args.content  = '';
			browser.window.args.url      = '';
			browser.window.args.filename = '';
			browser.window.args.download = '';

			const mimes = await (await fetch('/static/mime-extensions.json')).json();
			const extension = String(String(file.path).split('.').pop());
			const mimeType = typeof mimes['.' + extension] === 'object' ? mimes['.' + extension].type : mimes['.' + extension] ?? '';
			const [mediaType, subType] = mimeType.split('/');

			let content = await msgBus.readFile('/' + file.path)

			if(mediaType === 'text' || mediaType === 'application' || mediaType === '')
			{
				// content = decodeURIComponent(escape(atob(content)));
				content = new TextDecoder().decode(content);
				browser.window.args.content = content;
			}
			else
			{
				browser.window.args.download = URL.createObjectURL(new Blob([content]));
			}

			browser.window.args.filename = file.name;
			browser.window.args.filepath = '/' + file.path;

			Router.go(`/${browser.cmd}/${file.path}`, 2);
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
