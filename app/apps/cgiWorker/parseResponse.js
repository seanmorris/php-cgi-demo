export default response => {
	const headers = {};
	// const len = response.length;
	// let pos = 0;

	// while(true)
	// {
	// 	const crlf = response.indexOf('\r\n', pos);

	// 	if(pos === crlf || pos > len || crlf < 0)
	// 	{
	// 		break;
	// 	}

	// 	const line = response.substring(pos, crlf);

	// 	if(line === '\n')
	// 	{
	// 		break;
	// 	}

	// 	const colon = line.indexOf(':');

	// 	if(colon < 0)
	// 	{
	// 		headers[ line ] = true;
	// 	}
	// 	else
	// 	{
	// 		headers[ line.substring(0, colon) ] = line.substring(colon + 2);
	// 	}

	// 	pos = crlf + 2;
	// }

	// const body = response.substring(pos + 2);

	const line = [];
	const decoder = new TextDecoder();
	let i = 0;
	for(; i < response.length; i++)
	{
		if(response[i] === 0xD && response[i+1] === 0xA) // We're at a CRLF
		{
			if(line.length)
			{
				const header = decoder.decode(new Uint8Array(line).buffer);
				const colon = header.indexOf(':');

				if(colon < 0)
				{
					headers[ header ] = true;
				}
				else
				{
					headers[ header.substring(0, colon) ] = header.substring(colon + 2);
				}

				line.length = 0;
				i++;
				continue;
			}
			else
			{
				i++;
				break;
			}
		}

		line.push(response[i]);
	}

	return {headers, body: new Uint8Array(response.slice(1+i)).buffer };
};
