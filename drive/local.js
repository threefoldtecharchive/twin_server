const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const process = require("process")
const config = require('../config')
const utils = require('./utils')

class LocalDrive{
    constructor(){
        this.name = "local"
        this.load = async function() {
            this.base = config.publishtools.root
            if(!fs.statSync(this.base)){
                console.log(chalk.red(`\t(X) Can not load local drive - publishtools root dir does not exist ${this.base})`))
                process.exit(1)
            }
            console.log(chalk.green(`✓ (LocalDrive Drive) loaded @${this.base}`))
            return await utils.loadInfo(this)
        }
    }
}

var obj = new LocalDrive()
obj.promises =  {
    stat : async function(filepath){
        return fs.lstatSync(path.join(obj.base, filepath));
    },
    readdir: async function(dirpath){
        return fs.readdirSync(path.join(obj.base, dirpath));
    },
    readFile: async function(filepath, encoding, web){
        var fp = path.normalize(path.join(obj.base, filepath)).replace(/^(\.\.(\/|\\|$))+/, '');
        var staticpath =  path.normalize(path.join(obj.base, '..', 'static')).replace(/^(\.\.(\/|\\|$))+/, '');
       
        if (web && !fp.startsWith(obj.base) && !fp.startsWith(staticpath)){
                throw new Error("Invalid path")
        }

        if (encoding == 'binary'){
            return fs.readFileSync(fp)
        }
        return fs.readFileSync(fp, encoding)
    },
}

module.exports = obj
