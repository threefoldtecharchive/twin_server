const fs = require('fs');
const chalk = require('chalk')

const utils = require('./utils')

async function load(config_path){
    let config = "";
    try{
        config_path = config_path || 'config.json'
        config = JSON.parse(fs.readFileSync(config_path));
        config.publishtools.root = await utils.resolvePath(config.publishtools.root)
        config.publishtools.config = await utils.resolvePath(config.publishtools.config)
        config.hyperdrive.path = await utils.resolvePath(config.hyperdrive.path)
    }catch(e){
        console.log(chalk.red('X (Config) could not be loaded'))
        console.log(e)
        process.exit(1)
    }

    for(var item in config){
        this[item] = config[item]
    }
    console.log(chalk.green(`✓ (Config) loaded from ${config_path}`))
}

// Config class
class Config{
    constructor(){
         this.load = load
    }
}

module.exports = new Config()