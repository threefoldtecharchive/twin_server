const fs = require('fs');
const chalk = require('chalk')

const utils = require('./utils')

async function load(){
    let config = null;
    try{
        config = JSON.parse(fs.readFileSync('config.json'));
        config.publishtools.root = await utils.resolvePath(config.publishtools.root)
        config.hyperdrive.path = await utils.resolvePath(config.hyperdrive.path)
    }catch(e){
        console.log(chalk.red('X (Config) could not be loaded'))
        console.log(e)
        process.exit(1)
    }

    for(var item in config){
        this[item] = config[item]
    }
    console.log(chalk.green('✓ (Config) loaded'))
}

// Config class
class Config{
    constructor(){
         this.load = load
    }
}

module.exports = new Config()