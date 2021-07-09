const fs = require('fs');
const chalk = require('chalk')

async function load(){
    let config = null;
    
    try{
        config = JSON.parse(fs.readFileSync('rewrite.json'));
        
    }catch(e){
        console.log(chalk.red('X (Rewrite file) file could not be loaded'))
        console.log(e)
        process.exit(1)
    }

    console.log(chalk.green('✓ (Rewrite file) loaded'))
    return config
}

class Rewrite{
    constructor(){
         this.load = load
    }
}

module.exports = new Rewrite()