import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { MenuBar  } from '../../window/MenuBar';
import { Bindable } from 'curvature/base/Bindable';

import { GitHub } from '../gitHub/GitHub';

import { Folder } from './Folder';
import { Icons as IconControl } from '../../control/Icons';
import { Html as HtmlControl }  from '../../control/Html';
import { Markdown as MarkdownControl }  from '../../control/Markdown';
import { Json as JsonControl } from '../../control/Json';
import { Image as ImageControl } from '../../control/Image';
import { Plaintext as PlaintextControl } from '../../control/Plaintext';

import { Console as Terminal } from 'subspace-console/Console';

import { GitHubBackend } from './GitHubBackend';
import { IdbfsBackend } from './IdbfsBackend';

const fileSystems = [
	{
		type: 'github',
		repo: 'nynex95',
		user: 'seanmorris',
	},
	{
		type: 'idbfs-proxy'
	},
	{
		type: 'nynex-fs'
	}
];

export class RepoBrowser extends Task
{
	static helpText = 'Browse projects on github.';

	title    = 'Omni Explorer';
	icon     = '/w95/73-16-4bit.png';
	template = require('./main.tmp');
	useProxy = false;

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);

		const inputPath = (taskPath[0] || '/').split('/');
		// this.username = inputPath.shift()   || 'seanmorris';
		// this.reponame = inputPath.shift()   || 'nynex95';
		this.filepath = inputPath.join('/');

		this.window.args.branch = 'master';

		this.window.args.width  = `760px`;
		this.window.args.height = `640px`;

		this.window.args.viewRaw = 'view-control-rendered';

		this.window.args.hasSource = false;

		this.window.upDirectory = event => this.upDirectory(event);
		this.window.newDirectory = event => this.newDirectory(event);
		this.window.refresh = event => this.refresh(event);
		this.window.newFile = event => this.newFile(event);
		this.window.renameFile = event => this.renameFile(event);
		this.window.deleteFile = event => this.deleteFile(event);
		this.window.downloadFile = event => this.downloadFile(event);
		this.window.uploadFile = event => this.uploadFile(event);

		this.window.viewControl = (type) => {
			this.window.args.viewRaw = `view-control-${type}`;
			this.window.args.plain.resize();
		}

		this.window.selectParent = (event) => {

			if(!this.parent)
			{
				return;
			}

			this.parent.select();

			if(this.parent instanceof Folder)
			{
				this.parent.expand(null, null, true);
			}

		};

		this.window.classes['hide-right'] = true;

		this.window.save = (event) => {
			this.backend.saveFile({browser:this});
		}

		this.window.toggleSection = (section) => {
			const clas = 'hide-' + section;
			this.window.classes[clas] = !!!this.window.classes[clas];

			const center   = this.window.findTag('[data-center-col]');

			if(center)
			{
				center.style.maxWidth = null;
			}

		}

		const home = Home.instance();

		this.window.githubLogin = (event) => {

			home.run('github').thread.then(result=>{

				this.window.args.repoIcons = [];
				this.loadRepos();

			});
		};

		this.window.addEventListener('rendered', () => {
			this.console = new Terminal({scroller: this.window.tags.termscroll.element });

			this.console.addEventListener('listRendered', event => {
				this.window.onTimeout(300, () => {
					const height = this.window.tags.termscroll.element.clientHeight;
					const scroll = this.window.tags.termscroll.element.scrollHeight;

					this.window.tags.termscroll.scrollTo({
						top: scroll + height, behavior: 'smooth'
					});
				});
			});

			this.window.args.terminal = this.console;

			this.console.args.prompt = '';

			// this.window.args.menuBar  = new MenuBar(this.args, this.window);

			this.window.args.filetype = '';
			this.window.args.chars    = '';

			this.window.classes['repo-browser'] = true;

			this.window.args.bindTo('repoUrl', v => {

				this.print(`Scanning repository @ ${v}.`);

				this.window.args.files = [];

				if(!v)
				{
					return;
				}

				Home.instance().run('cgi-worker', ['--start-quiet'], true);

				/*/
				const folder = new Folder({
					expanded: true
					, backend:  this.backend = new GitHubBackend
					, browser:  this
					, pathOpen: this.filepath
					, url:      v + '/contents?ref=master&t=' + Date.now()
				}, this.window);
				/*/
				const folder = new Folder({
					expanded: true
					, backend:  this.backend = new IdbfsBackend
					, browser:  this
					, pathOpen: this.filepath
					, url:      '/'
				}, this.window);
				//*/

				this.window.args.files.push(folder);

				// if(!this.filepath)
				// {
				// 	this.window.onNextFrame(()=>this.loadFile('README.md'));
				// }
				// else
				// {
				// 	// this.window.onNextFrame(()=>this.loadFile(this.filepath));
				// 	// folder.select();
				// }

				this.loadRepos();

				folder.expand();
			});

			this.window.args.bindTo('filename', v => {

				v && this.print(`Loading file: "${v}"`);

				if(this.window.args.plain)
				{
					this.window.args.plain.remove();
					this.window.args.plain = '';
				}

				if(this.window.args.control)
				{
					this.window.args.control.remove();
					this.window.args.control = '';
				}

				if(!v)
				{
					return;
				}

				const gitHubToken = GitHub.getToken();
				const filetype = (v||'').split('.').pop();

				this.window.args.filetype = filetype || '';

				this.window.args.chars = 0;

				this.window.args.hasSource = false;

				this.window.args.plain  = new PlaintextControl(
					this.window.args, this
				);

				this.window.args.plain.args.url = this.window.args.url;

				switch(filetype)
				{
					case 'md':
						this.window.args.viewRaw   = 'view-control-rendered';

						this.window.args.hasSource = true;

						this.window.args.control = new MarkdownControl(
							{content:''}, this
						);

						break;

					case 'html':
						this.window.args.viewRaw   = 'view-control-rendered';

						this.window.args.hasSource = true;

						this.window.args.control = new HtmlControl(
							{content:''}, this
						);

						break;

					case 'ico':
					case 'gif':
					case 'png':
					case 'jpg':
					case 'jpeg':
					case 'webp':

						this.window.args.viewRaw = 'view-control-rendered';

						this.window.args.control = new ImageControl(
							{src:this.window.args.download}
							, this
						);
						break;

					case 'json':
						this.window.args.hasSource = true;
						this.window.args.viewRaw = 'view-control-plain';

						this.window.args.expanded = true;

						const jsonControl = new JsonControl(
							{
								expanded:  true
								, content: ''
							}, this
						);

						jsonControl.args.bindTo(
							'content'
							, v => this.window.args.content = v
							, {now: false}
						);

						this.window.args.control = jsonControl;

						break;

					default:
						// this.window.args.hasSource = true;

						this.window.args.viewRaw = 'view-control-rendered';
						this.window.args.control = new PlaintextControl(
							this.window.args, this
						);
						break;
				}

				this.window.args.control.args.content = this.window.args.content || '';

				this.window.args.chars = (this.window.args.content||'').length;
			});

			this.window.args.bindTo('content', v => {
				if(this.window.args.control)
				{
					this.window.args.control.args.content = v;
				}
				if(this.window.args.plain)
				{
					this.window.args.plain.args.content = v;
				}
			});

			this.window.addEventListener('resized', (event) => {
				if(this.window.args.control && this.window.args.control.resize)
				{
					this.window.args.control.resize();
				}
				if(this.window.args.plain && this.window.args.plain.resize)
				{
					this.window.args.plain.resize();
				}
			});

			if(this.filepath)
			{
				// this.loadFile(this.filepath);
			}
		});

		this.endpoint = this.useProxy
			? 'https://nynex.seanmorr.is/github-proxy/'
			: 'https://api.github.com/'
		;

		this.endpointRepos = `${this.endpoint}repos`
		this.startingRepo  = `${this.username || 'seanmorris'}/${this.reponame || 'nynex95'}`;

		// console.log(this.username, this.reponame);

		this.window.args.repoUrl   = `${this.endpointRepos}/${this.startingRepo}`;
		this.window.args.repoName  = this.startingRepo;
		this.window.args.repoIcons = false;

		this.window.args.repoIcons = [];
	}

	upDirectory(event)
	{
		if(!this.parentDir || !(this.parentDir instanceof Folder))
		{
			console.log(this.parentDir);

			return;
		}

		this.parentDir.select();
	}

	print(line)
	{
		if(this.console)
		{
			this.console.args.output.push(line);
		}
	}

	refresh()
	{
		if(!this.currentDir)
		{
			return;
		}

		if(this.currentDir === this.current)
		{
			this.currentDir.select();
		}
		else
		{
			this.currentDir.expand(null, null, null, true);
		}
	}

	newFile()
	{
		console.log(this.currentDir);

		const subArgs = {
			template:    require('./edit-name.tmp.html')
			, title:     'New File'
			, directory: this.currentDir.args.url
			, type:      'create'
			, width:     '400px'
			, minWidth:  '400px'
			, height:    '196px'
			, minHeight: '196px'
		};

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {
			const newPath = subArgs.directory + '/' + subArgs.newName;
			this.backend.writeFile({path: newPath, content: ''})
			.then(() => this.refresh());
			subWindow.close();
		};

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	newDirectory()
	{
		console.log(this.currentDir);

		const subArgs = {
			template:    require('./edit-name.tmp.html')
			, title:     'New Directory'
			, directory: this.currentDir.args.url
			, type:      'create'
			, width:     '400px'
			, minWidth:  '400px'
			, height:    '196px'
			, minHeight: '196px'
		};

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {
			const newPath = subArgs.directory + '/' + subArgs.newName;
			this.backend.mkdir({path: newPath})
			.then(() => this.refresh());
			subWindow.close();
		};

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	renameFile()
	{
		console.log(this.selected);

		const subArgs = {
			template:    require('./edit-name.tmp.html')
			, title:     'Rename File'
			, path: this.selected.args.url
			, type:      'rename'
			, width:     '400px'
			, minWidth:  '400px'
			, height:    '196px'
			, minHeight: '196px'
		};

		const parts = subArgs.path.split('/');
		const directory = parts.slice(0, parts.length - 1).join('/');

		subArgs.newName = parts[parts.length -1];

		const subWindow = this.openSubWindow(subArgs);

		subWindow.save = () => {
			this.backend
			.renameFile({newName: directory + '/' + subArgs.newName, oldName: subArgs.path})
			.then(() => {
				this.refresh()
				subWindow.close();
			});
		};

		subWindow.cancel = () => subWindow.close();

		subWindow.focus();
	}

	deleteFile()
	{
		if(!this.selected)
		{
			return;
		}

		if(this.selected.args.file.info.object.isFolder)
		{
			this.backend.deleteFolder({path: '/' + this.selected.args.file.path})
			.then(() => this.refresh());
		}
		else
		{
			this.backend.deleteFile({path: '/' + this.selected.args.file.path})
			.then(() => this.refresh());
		}
	}

	downloadFile()
	{
		const path = '/' + this.selected.args.file.path;
		const parts = path.split('/');

		this.backend.readFile({path}).then(content => {
			content = new TextDecoder().decode(content);
			const link = document.createElement('a');
			link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
			link.setAttribute('download', parts[parts.length - 1]);

			link.click();
		});
	}

	uploadFile()
	{

	}

	loadFile(filepath)
	{}

	saveFile(event)
	{}

	loadRepos(page = 0)
	{
		// const gitHubToken = GitHub.getToken();

		// page || this.print(`Scanning for repositories...`);

		// this.window.args.repos = this.window.args.repos || false;

		// const reposUrl = `${this.endpoint}user/repos?per_page=100&page=${1+parseInt(page)}`
		// const headers  = {};

		// if(gitHubToken && gitHubToken.access_token)
		// {
		// 	headers.Authorization = `token ${gitHubToken.access_token}`;
		// }

		// fetch(reposUrl, {headers}).then(r=>r.json()).then((repos)=>{

		// 	if(!repos || !repos.length)
		// 	{
		// 		return;
		// 	}

		// 	repos.map && this.window.args.repoIcons.push(...repos.map(repo => {

		// 		this.window.args.repos = true;

		// 		this.print(`Found repo "${repo.name}"`);

		// 		return new Icon({
		// 			action: () => {
		// 				this.window.args.repoName = repo.full_name;
		// 				this.window.args.repoUrl  = repo.url;
		// 			}
		// 			, name:  repo.name
		// 			, icon: 'network_drive'
		// 			, path: 'w98'
		// 			, bits: 4
		// 		});
		// 	}));

		// 	if(repos && repos.length)
		// 	{
		// 		this.loadRepos(page + 1);
		// 	}
		// });
	}
}
