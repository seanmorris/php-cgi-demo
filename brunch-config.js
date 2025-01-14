const { exec } = require('child_process');

module.exports = {
	files: {
		javascripts: {
			entryPoints: {
				'app/apps/cgiWorker/DrupalWorker.js': 'DrupalWorker.js'
				, 'app/initialize.js': 'app.js'
			}
			, joinTo: {
				// 'reload.js': /^node_modules/auto-reload-brunch/,
			}
		}
		, templates: {joinTo: 'templates.js'}
		, stylesheets: {joinTo: 'app.css'}
	}
	, plugins: {
		babel: {
			presets: ['@babel/preset-env', ['minify', {builtIns: false}]],
			plugins: [
				"@babel/plugin-proposal-class-properties",
				"macros"
			]
		}
		, preval: {
			tokens: {
				BUILD_TIME:  Date.now() / 1000
				, BUILD_TAG: process.env.ENV_LOCK_TAG || 'notag'
				, BUILD_LOCALTIME: new Date
			}
			, log: true
		}
		, raw: {
			pattern: /\.tmp\.(.+)$/,
			wrapper: content => `module.exports = ${JSON.stringify(content)}`
		}
		, terser: {
			ignored: /php-web.js/,
		}
	}
	, npm: {
		styles: {
			'subspace-console': ['style/layout.css']
			, 'highlight.js':   ['styles/default.css']
		}
	}
	, paths: { public: './docs'	}
	, modules: {
		autoRequire: {
			'DrupalWorker.js': ['apps/cgiWorker/DrupalWorker']
		}
	}
	, watcher: {
		awaitWriteFinish: true,
		usePolling: true
	}
};

// module.exports.hooks = {
// 	preCompile: () => {
// 		console.log('About to compile...');
// 		exec(
// 			`npm link curvature subspace-console cv-markdown php-wasm matrix-api`
// 			, (err, stdout, stderr)=>{
// 				console.log(err);
// 				console.log(stdout);
// 				console.log(stderr);

// 				return Promise.resolve();
// 			}
// 		)
// 	}
// };
