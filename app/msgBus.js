const incomplete = new Map;

const onMessage = event => {
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
};

navigator.serviceWorker.addEventListener('message', onMessage);

const sendMessage = (action, params, accept, reject) => {
	const token  = crypto.randomUUID();
	const result = new Promise((_accept, _reject) => [accept, reject] = [_accept, _reject]);

	incomplete.set(token, [accept, reject]);

	navigator.serviceWorker
	.getRegistration(`${location.origin}/DrupalWorker.js`)
	.then(registration => registration.active.postMessage({action, params, token}));

	return result;
};

export const msgBus = new Proxy(Object.create(null), {
	get: (target, action, receiver) => (...params)  => sendMessage(action, params)
});
