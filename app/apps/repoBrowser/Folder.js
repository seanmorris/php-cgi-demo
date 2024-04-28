import { Router } from 'curvature/base/Router';
import { View } from 'curvature/base/View';
import { Bindable } from 'curvature/base/Bindable';

import { Icon } from '../../icon/Icon';
import { Icons as IconControl } from '../../control/Icons';
import { GitHubBackend } from './GitHubBackend';

export class Folder extends View
{
	constructor(args = {}, parent = null)
	{
		super(args, parent);

		this.files = {};

		this.args.expanded = args.expanded || false;
		this.args.pathOpen = args.pathOpen || null;

		this.args.files = [];

		if(!args.file || args.file.type === 'dir')
		{
			this.args.icon = this.args.iconClosed || '/w95/4-16-4bit.png';

			if(this.args.expanded)
			{
				this.args.icon = '/w95/5-16-4bit.png';
			}
		}
		else
		{
			this.args.icon = '/w95/60-16-4bit.png';
		}

		this.args.name = args.name || '.';
		this.args.url  = args.url  || '';
		this.args.file = args.file || null;

		this.template  = require('./folder.tmp');
	}

	attached()
	{
		if(!this.args.pathOpen)
		{
			return;
		}

		if(!this.args.file)
		{
			return;
		}

		const path = this.args.file.path;

		if(this.args.pathOpen.substr(0, path.length) === path)
		{
			this.expand(null, null, this.parent)
			.then(() => this.args.pathOpen = null);
		}

		if(this.args.pathOpen === path)
		{
			this.args.pathOpen = null;
			this.select();
		}
	}

	select(event, child)
	{
		if(event)
		{
			event.stopImmediatePropagation();
			event.stopPropagation();
		}

		if(this.args.browser.selected)
		{
			this.args.browser.selected.args.focused = '';
		}

		this.args.browser.selected = this;
		this.args.browser.selected.args.focused = 'focus';

		if(this.tags.focus && this.tags.focus.element)
		{
			this.tags.focus.element.focus();
		}

		this.args.browser.parentDir = this.parent;
		this.args.browser.currentDir = this.parent;
		this.args.browser.current = this;

		if(this.args.file && event)
		{
			Router.go(
				`/${this.args.browser.cmd}`
				// +`/${this.args.browser.username}`
				// +`/${this.args.browser.reponame}`
				+`/${this.args.file.path}`
				, 2
			);
		}

		if(!this.args.file || this.args.file.type !== 'dir')
		{
			return;
		}

		this.args.browser.currentDir = this;

		this.populate(this.args.url).then((files) => {

			if(!Array.isArray(files))
			{
				return;
			}

			const iconList = new IconControl({}, this);

			const icons = files.map((file, key) => {
				if(file.name === '.' || file.name === '..')
				{
					return;
				}
				const name = file.name;
				const action = () => {

					this.args.browser.parentDir = this;

					if(file.type === 'dir')
					{
						if(this.files[name])
						{
							this.files[name].expand(event, child, this, true);
							this.files[name].select();
						}
					}
					else
					{
						this.showControl(file, this);
						this.files[name].select();
					}
				};

				const icon = new Icon({icon:file.type === 'dir' ? 4:60, name, action});

				iconList.args.icons.push(icon);

				return icon;
			});

			this.args.browser.window.args.filename = this.args.name;
			this.args.browser.window.args.control  = iconList;
			this.args.browser.window.args.viewRaw  = 'view-control-rendered';

			console.log(iconList);
		});
	}

	expand(event, child, dir, open = undefined)
	{
		if(this.expanding)
		{
			return this.expanding;
		}

		this.args.browser.window.args.file = this.args.file;

		if(this.args.browser.selected)
		{
			this.args.browser.selected.args.focused = '';
		}

		this.args.browser.selected = this;
		this.args.browser.selected.args.focused = 'focus';

		this.expanding = new Promise((accept, reject) => {

			if(this.args.file && this.args.file.type === 'dir')
			{
				if(open === true)
				{
					this.args.expanded = true;
					this.args.icon     = this.args.iconOpen || '/w95/5-16-4bit.png';
				}
				else if(open === false)
				{
					this.args.expanded = false;
					this.args.icon     = this.args.iconClosed || '/w95/4-16-4bit.png';
				}
				else if(this.args.expanded)
				{
					this.args.icon     = this.args.iconClosed || '/w95/4-16-4bit.png';
					this.args.expanded = false;
				}
				else
				{
					this.args.icon     = this.args.iconOpen || '/w95/5-16-4bit.png';
					this.args.expanded = true;
				}
			}

			this.populate(this.args.url).then(() => {
				if(event)
				{
					event.stopImmediatePropagation();
					event.stopPropagation();
				}

				this.expanding = false;

				if(this.args.file && this.args.file.type !== 'dir')
				{
					this.showControl(this.args.file, dir);
				}

				accept();
			}).catch(error => {
				this.expanding = false;
				this.args.browser.print('Error: ' + error.message);
				reject(error);
			});
		});

		return this.expanding;
	}

	showControl(file, dir)
	{
		const backend = this.args.backend;

		this.args.browser.parentDir = this.parent;

		backend.displayFile({file, dir, browser: this.args.browser})
		.catch(error => this.args.browser.print(
			`Error:  ${error.message} ${error.code} ${error.message}`
		));
	}

	populate(url)
	{
		if(this.populating)
		{
			return this.populating;
		}

		const backend = this.args.backend;
		// console.log({url});
		// const uri = '';

		this.args.files = [];

		this.populating = backend.populate({
			uri: url
			, folder: this
			, pathOpen : this.args.pathOpen
			, browser: this.args.browser
		});

		this.populating.finally(() => this.populating = null);

		return this.populating
	}
}



// this.args.name = args.name || '.';
// this.args.url  = args.url  || '';
// this.args.file = args.file || null;
// // this.args.url  = args.url  || 'https://nynex.unholysh.it/github-proxy/repos/seanmorris/nynex95/contents?ref=master&t=' + Date.now();
// // this.args.url  = args.url  || 'https://red-cherry-cb88.unholyshit.workers.dev/repos/seanmorris/nynex95/contents?ref=master';
// // this.args.url  = args.url  || 'https://api.github.com/repos/seanmorris/nynex95/contents?ref=master';
// this.template  = require('./folder.tmp');
