import fs from "fs";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

function startCliApp(startAppWithConfig, options = {}) {
	const cliOptions = [
		...options.cliOptions,
		{name: "help", alias: "h", description: "Display this help", type: Boolean}
	]

	const config = {
		...configFromDefaults(cliOptions), // lowest priority: defaults
		...configFromEnvvars(cliOptions), // env variables from env or .env
		...configFromCommands(cliOptions) // top priority: command line
	};

	if(config.help)
		displayHelp(options.packageInfo, cliOptions);
	else {
		(async () => {
			try {
				await startAppWithConfig(config);
			}
			catch(error) {
				console.error(error);
				process.exit(1);
			}
		})();
	}
}

function packageInfoFromInfoOrPath(packageInfoOrPath) {
	if(typeof packageInfoOrPath === "object" && packageInfoOrPath)
		return packageInfoOrPath;
	else if(typeof packageInfoOrPath === "string")
		return JSON.parse(fs.readFileSync(packageInfoOrPath, 'utf8'))
}

function displayHelp(packageInfoOrPath, cliOptions) {
	const commandSections = [];

	const packageInfo = packageInfoFromInfoOrPath(packageInfoOrPath);

	if(packageInfo) {
		commandSections.push({
			header: packageInfo.name,
			content: [
				'Version: ' + packageInfo.version,
				'Description: ' + packageInfo.description
			]
		});
	}

	commandSections.push({
		header: 'Command Line Options',
		optionList: cliOptions
	});

	console.log(commandLineUsage(commandSections));
}

function configFromDefaults(commandOptions) {
	return commandOptions.reduce((config, commandOption) => {
		if(commandOption.hasOwnProperty('default'))
			config[commandOption.name] = commandOption.default;
		return config;
	}, {});
}

function configFromEnvvars(commandOptions) {
	// convert envvar keys to lowercase FOO=Bar becomes foo=Bar
	const envvarsLowercase = Object.keys(process.env).reduce((envvarsLowercase, envvarKey) => {
		envvarsLowercase[envvarKey.toLowerCase()] = process.env[envvarKey];
		return envvarsLowercase;
	}, {});

	// extract variables from process.env
	return commandOptions.reduce((config, commandOption) => {
		if(commandOption.hasOwnProperty('envvar') && envvarsLowercase.hasOwnProperty(commandOption.envvar.toLowerCase())) {
			if(commandOption.multiple) // split by ,
				config[commandOption.name] = envvarsLowercase[commandOption.envvar.toLowerCase()].split(",").map(commandOptionItem => castVariable(commandOptionItem.trim(), commandOption.type));
			else
				config[commandOption.name] = castVariable(envvarsLowercase[commandOption.envvar.toLowerCase()], commandOption.type);
		}

		return config;
	}, {});
}

function configFromCommands(commandOptions) {
	return commandLineArgs(commandOptions);
}

// TODO add auto-determine
function castVariable(value, cast) {
	if(cast === Boolean && typeof value === "string")
		return ['true', '1'].includes(value.toLowerCase());

	return cast(value);
}

export default startCliApp;
