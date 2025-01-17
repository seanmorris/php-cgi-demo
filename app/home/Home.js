import { Router } from 'curvature/base/Router';
import { Bag  } from 'curvature/base/Bag';
import { View } from 'curvature/base/View';

import { Desktop  } from 'desktop/Desktop';
import { Window   } from 'window/Window';
import { TaskBar  } from 'task/TaskBar';
import { Task     } from 'task/Task';
import { Path     } from '../Path';

export class Home extends View
{
	static singleton = false;

	static path = Path;

	static instance()
	{
		if(this.singleton)
		{
			return this.singleton;
		}

		return this.singleton = new this;
	}

	constructor(args)
	{
		super(args);

		this.template = require('./home.tmp');

		this.open = {x: 120, y: 50};

		this.args.desktop = new Desktop({}, this);

		this.args.isMobile = !!String(navigator.userAgent).match(/(android|iphone)/i);

		this.tasks   = new Bag();
		this.tray    = new Bag();
		this.windows = new Bag((i,s,a) => {

			if(a !== Bag.ITEM_ADDED)
			{
				return;
			}

			i.windows = this.windows;

			i.pos.x = this.open.x;
			i.pos.y = this.open.y;

			this.open.x += 57;
			this.open.y += 93;

			this.open.x %= Math.floor(window.innerWidth / 2);
			this.open.y %= Math.floor(window.innerHeight / 2);

			// console.log(this.open.x, this.open.y);
		});

		window.name = View.uuid();

		// this.windows.type = Window;
		// this.tasks.type   = Task;

		const taskBar = new TaskBar({
			tasks:  this.tasks.list
			, tray: this.tray.list
		});

		this.args.windows  = this.windows.list;
		this.args.taskBar  = taskBar;

		this.onRemove(()=>delete this.args.windows);

		this.args.hideOutline = 'hide';

		// this.args.tasks    = this.tasks.list;
		// this.args.tray     = this.tray.list;

		this.routes = {

			// '': () => {}
			'': () => Router.go('/installer')

			, '*': (args) => {

				const taskName = args.pathparts.shift() || 'omni-explorer';
				const taskPath = args.pathparts.slice() || '/seanmorris/nynex95/package.json';

				if(taskName)
				{
					this.startTask = this.run(taskName, [taskPath.map(decodeURI).join('/')]);
				}

			}
		};

		this.args.outlineTop    = 0;
		this.args.outlineLeft   = 0;
		this.args.outlineWidth  = 0;
		this.args.outlineHeight = 0;
	}

	onAttach()
	{
		if(this.startTask)
		{
			delete this.startTask;
			// this.onTimeout(150, () => this.startTask.window.maximize());
		}
	}

	run(taskName, taskPath, quiet = false)
	{
		const taskPathString = taskPath
			? '/' + taskPath.join('/')
			: '';

		if(!quiet)
		{
			Router.go('/' + taskName + taskPathString, 2);
		}

		const taskType = Home.path[taskName] || false;

		if(!taskType)
		{
			alert(`${taskName}: Bad command or filename: "${taskName}".`);
			return false;
		}

		const task = new taskType([], null, null, this.tasks, taskName, taskPath);

		task.cmd = taskName;

		task.catch(error => console.warn(error));

		this.onTimeout(250, () => {
			task.signal(new CustomEvent('start'))
		});

		return task;
	}

	showOutline()
	{
		this.args.hideOutline = '';
	}

	moveOutline(l, t, w, h, now = false)
	{
		requestAnimationFrame(()=>{

			const orig = this.args.hideOutline;

			if(now)
			{
				this.args.hideOutline = 'hide teleport';
			}

			this.args.outlineTop    = t;
			this.args.outlineLeft   = l;
			this.args.outlineWidth  = w;
			this.args.outlineHeight = h;

			requestAnimationFrame(()=>{
				if(now)
				{
					this.args.hideOutline = orig;
				}
			});

		});
	}

	hideOutline()
	{
		this.args.hideOutline = 'hide';
	}
}
