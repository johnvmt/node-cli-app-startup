# node-cli-app-startup
Gathers app configuration from CLI or ENV vars and passes them to function

## Example

```
import startCliApp from "cli-app-startup";
import path, {dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

startCliApp(
    (config) => {
        console.log("Started with config", config);
    },
    {
        cliOptions: [
            {name: "my-var", alias: "m", defaultOption: true, envvar: "my_var", default: "defaultvalue", description: "A custom CLI option or ENV var", type: String}
        ],
        packageInfo: path.join(__dirname, 'package.json')
    }
);
```