import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { Bindable } from 'curvature/base/Bindable';
import { msgBus } from '../../msgBus';

export class Sites extends Task
{
	// static helpText = 'Browse a list of icons.';

	title    = 'Sites';
	icon     = '/w98/template_world-48-4bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);
		this.window.showIcons   = event => this.showIcons(event);
		this.window.startServer = event => this.startServer(event);
		this.window.sponsor = event => this.sponsor(event);
		return Bindable.make(this);
	}

	attached()
	{
		this.showIcons();
	}

	async showIcons()
	{
		this.window.args.icons = [];

		const sites = await this.loadSites();

		this.window.args.icons = sites.map(site => {

			const icon = new Icon({
				action: (event) => window.open(location.origin + site.pathPrefix)
				, name: site.pathPrefix
				, icon: 'template_world'
				, path: 'w98'
				, bits: 4
			});

			return icon;

		});
	}

	startServer()
	{
		Home.instance().run('cgi-worker', ['--start'], true);
	}

	sponsor()
	{
		window.open('https://github.com/sponsors/seanmorris');
	}

	async loadSites()
	{
		this.init = Date.now();

		const info = await msgBus.analyzePath('/config/init.json');

		if(!info.exists)
		{
			return [];
		}

		const content = await msgBus.readFile('/config/init.json');
		const json = new TextDecoder().decode(content);
		const init = JSON.parse(json);

		if(!init.settings.vHosts)
		{
			return [];
		}

		return init.settings.vHosts;
	}
}
