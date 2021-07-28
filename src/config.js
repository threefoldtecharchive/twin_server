const fs = require('fs');
const chalk = require('chalk')

const utils = require('./utils')

async function load(){
    let config = null;
    try{
        config = JSON.parse(fs.readFileSync('config.json'));
        config.publishtools.root = await utils.resolvePath(config.publishtools.root)
        config.hyperdrive.path = await utils.resolvePath(config.hyperdrive.path)
        config.nodejs.production = process.env.NODE_ENV == 'production'

        var ssl = process.env.ENABLE_SSL || ''
        config.nodejs.ssl = ssl.toLowerCase() == 'true' || false
        
        if(config.nodejs.production){
            var passPhrase = process.env.THREEBOT_PHRASE
            var secret = process.env.SECRET

            if(!passPhrase){
                throw new Error("THREEBOT_PHRASE Env variable must be set for production")
            }
            if(!secret){
                throw new Error("SECRET Env variable must be set for production")
            }
            config.threebot.passPhrase = passPhrase
            config.http.session.secret = secret
        }
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