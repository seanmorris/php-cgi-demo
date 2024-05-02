import { Task } from 'task/Task';
import { Icon } from '../../icon/Icon';
import { Home } from '../../home/Home';

import { Bindable } from 'curvature/base/Bindable';
import { msgBus } from '../../msgBus';

export class Help extends Task
{
	// static helpText = 'Browse a list of icons.';

	title    = 'Help';
	icon     = '/w98/help_book_big-48-4bit.png';
	template = require('./main.tmp');

	constructor(args = [], prev = null, term = null, taskList, taskCmd = '', taskPath = [])
	{
		super(args, prev, term, taskList, taskCmd, taskPath);
		this.window.args.height = `640px`;
		return Bindable.make(this);
	}
}
