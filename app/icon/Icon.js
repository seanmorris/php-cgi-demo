import { View } from 'curvature/base/View';

import { Home } from '../home/Home';

export class Icon extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template  = require('./icon.tmp');

		this.resource = args.action || false;//'/apps/icon-explorer-stats'
		this.action   = args.action || false;//'/apps/icon-explorer'

		this.args.name = args.name || ``;
		this.args.path = args.path || `w95`;
		this.args.size = args.size || `32`;
		this.args.bits = args.bits || `4`;
		this.args.icon = args.icon || '3';

		this.args.draggable = true;

		this.args.bindTo((v,k) => {

			if(!['path', 'size', 'bits', 'icon'].includes(k))
			{
				return;
			}

			const path = this.constructor.getPath(this.args.path, this.args.icon, this.args.size, this.args.bits);
			// const path = `/${this.args.path}/${this.args.icon}-${this.args.size}-${this.args.bits}bit.png`
			this.args.src = path;

		}, {idle:0});

		this.args.blinking = '';
	}

	static getPath(path, icon, size, bits)
	{
		return `/${path}/${icon}-${size}-${bits}bit.png`
	}

	onAttach()
	{
		const focusable = this.findTag('[tabindex]');

		this.listen(focusable, 'focus', event =>
			this.dispatchEvent(new CustomEvent('select', {detail:this.args}))
		);

		this.listen(focusable, 'blur', event =>
			this.dispatchEvent(new CustomEvent('deselect', {detail:this.args}))
		);
	}

	dblclick(event)
	{
		const home = Home.instance();

		let result = '';

		if(typeof this.action === 'function')
		{
			result = this.action(event);
		}
		else
		{
			result = this.action;
		}

		if(typeof result === 'string')
		{
			home.run(result);
		}
		else if(Array.isArray(result))
		{
			home.run(...result);
		}
		else if(result instanceof Promise)
		{
			result.then(result => {

				if(typeof result === 'string')
				{
					home.run(result);
				}
				else if(Array.isArray(result))
				{
					home.run(...result);
				}
			});
		}
	}

	blink()
	{
		this.args.blinking = 'blinking';

		this.onTimeout(100, () => {

			this.args.blinking = '';

		});
	}

	flash()
	{
		this.args.flashing = 'flashing';

		this.onTimeout(100, () => {

			this.args.flashing = '';

		});
	}

	flicker()
	{
		this.args.blinking = 'blinking';

		const flickerSlow = this.onInterval(100, () => {
			this.args.blinking = this.args.blinking
				? ''
				: 'blinking';
		});

		this.onTimeout(1250, () => {

			clearInterval(flickerSlow);

			this.args.blinking = '';

			const flickerFast = this.onInterval(25, () => {
				this.args.blinking = this.args.blinking
					? ''
					: 'blinking';
			});

			this.onTimeout(500, () => {

				clearInterval(flickerFast);

				this.args.blinking = '';

				const flickerFrame = this.onFrame(() => {
					this.args.blinking = this.args.blinking
						? ''
						: 'blinking';
				});

				this.onTimeout(500, () => {
					flickerFrame();
				});
			});
		});
	}

	glimmer()
	{
		this.args.flashing = 'flashing';

		const flickerSlow = this.onInterval(180, () => {
			this.args.flashing = this.args.flashing
				? ''
				: 'flashing';
		});

		this.onTimeout(1400, () => {

			clearInterval(flickerSlow);

			this.args.flashing = '';

			const flickerFast = this.onInterval(20, () => {
				this.args.flashing = this.args.flashing
					? ''
					: 'flashing';
			});

			this.onTimeout(400, () => {

				clearInterval(flickerFast);

				this.args.flashing = '';

				const flickerFrame = this.onInterval(20, () => {
					this.args.flashing = this.args.flashing
						? ''
						: 'flashing';
				});

				this.onTimeout(400, () => {
					clearInterval(flickerFrame);
				});
			});
		});
	}
}
