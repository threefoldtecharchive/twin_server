// a script to get config from env vars and write it in a JSON format
// if any config parameter is not passed, it will default to `src/config.json`

const process = require("process")
const fs = require("fs")
const defaultConfig = require("../src/config.json")

const env = process.env
// should build this map from default config?
const configMap = {
    "CONFIG_DNS_PORT": { 'type': 'int', 'path': ['dns', 'port'] },
    "CONFIG_DNS_ENABLED": { 'type': 'bool', 'path': ['dns', 'enabled'] },
    "CONFIG_HTTP_PORT": { 'type': 'int', 'path': ['http', 'port'] },
    "CONFIG_HTTP_SESSION_SECRET": { 'type': 'str', 'path': ['http', 'session', 'secret'] },
    "CONFIG_HTTP_DEVPORT": { 'type': 'int', 'path': ['http', 'devport'] },
    "CONFIG_HTTP_PUBLISHTOOLSPORT": { 'type': 'int', 'path': ['http', 'publishtoolsPort'] },
    "CONFIG_HYPERDRIVE_PATH": { 'type': 'str', 'path': ['hyperdrive', 'path'] },
    "CONFIG_HYPERDRIVE_ENABLED": { 'type': 'bool', 'path': ['hyperdrive', 'enabled'] },
    "CONFIG_HYPERDRIVE_DRIVES": { 'type': 'list', 'path': ['hyperdrive', 'drives'] },
    "CONFIG_PUBLISHTOOLS_ROOT": { 'type': 'str', 'path': ['publishtools', 'root'] },
    "CONFIG_PUBLISHTOOLS_SITESCONFIG": { 'type': 'str', 'path': ['publishtools', 'sitesConfig'] },
    "CONFIG_THREEBOT_PASSPHRASE": { 'type': 'str', 'path': ['threebot', 'passPhrase'] },
    "CONFIG_NODEJS_PRODUCTION": { 'type': 'bool', 'path': ['nodejs', 'production'] },
    "CONFIG_NODEJS_SSL": { 'type': 'bool', 'path': ['nodejs', 'ssl'] },
}

class EnvEntry {
    constructor(type, path) {
        this.type = type
        this.path = path
    }

    // get the value in correct type
    get(value) {
        // JSON.parse would work but will need every env var to be quoted
        // with a single quote, e.g. CONFIG_HTTP_SESSION_SECRET='"xyz"'
        // also, it would get the wrong value for the wrong type
        // if we want a string and the value was "true", then it would return a boolean
        value = value.trim()

        if (this.type === "int") {
            return parseInt(value)
        } else if (this.type === "bool") {
            if (value === "false" || value == "0") {
                return false
            } else {
                return true
            }
        } else if (this.type === "list") {
            return JSON.parse(value)
        } else {
            return value
        }
    }
}

class EnvConfig {
    constructor(defaultConfig) {
        this.config = Object.assign({}, defaultConfig)
    }

    set(envEntry, value) {
        if (!value) {
            return
        }

        const path = envEntry.path
        let config = this.config
        let key = path.pop()

        for (const subKey of path) {
            config = config[subKey]
        }

        config[key] = envEntry.get(value)
    }
}


function getFromEnv() {
    let config

    if (env.CONFIG) {
        // update config with this object
        config = Object.assign(defaultConfig, JSON.parse(env.CONFIG))
    } else {
        envConfig = new EnvConfig(defaultConfig)
        // read individual env vars and update config with them
        for (const [key, value] of Object.entries(configMap)) {
            let entry = new EnvEntry(value.type, value.path)
            const envValue = env[key]
            envConfig.set(entry, envValue)
        }
        config = envConfig.config
    }

    return config
}


const config = getFromEnv()

if (process.argv.length < 3) {
    // only print config
    console.log(config)
} else {
    const outPath = process.argv[2]
    try {
        fs.writeFileSync(outPath, JSON.stringify(config))
    } catch (e) {
        console.error(e)
    }
}
