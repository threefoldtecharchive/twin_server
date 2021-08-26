const fs = require('fs');
const chalk = require('chalk')
const { spawn } = require("child_process");

const utils = require('./utils')

async function updateSitesConfig(config){
    /* Example:
    https://github.com/threefoldfoundation/www_config_private/tree/main
    git@github.com:threefoldfoundation/www_config_private/tree/main
    */
    sitesConfigRepo = config.publishtools.sitesConfig;
    
    // After this condition output will be [threefoldfoundation, www_config_private, tree, main] for both.
    if (sitesConfigRepo.startsWith("git@")){
        sitesConfigRepo = sitesConfigRepo.split(':')[1].split('/')
    }else if(sitesConfigRepo.startsWith("https")){
        sitesConfigRepo = sitesConfigRepo.split('/').slice(3);
    }

    accountName = sitesConfigRepo[0]
    repoName = sitesConfigRepo[1]
    branchName = ""
    if (sitesConfigRepo.length > 2 && sitesConfigRepo[2] == "tree") {
        branchName = sitesConfigRepo[3]
    }

    getSitesConfig = spawn('echo', ['Get sites config repo'])
    repoLocalPath = `${config.publishtools.root}config`;
    if (fs.existsSync(`${repoLocalPath}/${repoName}`)){
        console.log(chalk.yellow("Sites config repo exist, will pull latest changes"))
        getSitesConfig = spawn(`
        cd ${repoLocalPath}/${repoName}
        git pull
        `, {shell: "/bin/bash"})
    }else{
        console.log(chalk.yellow(`Sites config repo not exist!\n> Cloning in ${repoLocalPath}/${repoName}`))
        fs.mkdirSync(repoLocalPath, {recursive: true})
        cloneCmd = '';
        if (branchName){
            cloneCmd = `git@github.com:${accountName}/${repoName} -b ${branchName}`;
        }else{
            cloneCmd = `git@github.com:${accountName}/${repoName}`;
        }
        getSitesConfig = getSitesConfig = spawn(`
        cd ${repoLocalPath}
        git clone ${cloneCmd}`, {shell: "/bin/bash"})
    }
    getSitesConfig.stdout.setEncoding('utf8');
    getSitesConfig.stdout.on('data', function (data) {
        console.log(`>> ${data}`)
    });

    getSitesConfig.stderr.on('data', function (data) {
        console.log(chalk.red(`>> error: ${data}`))
    });

    getSitesConfig.on('close', function (code) {
        if (code == 0) {
            console.log(chalk.green(`>> Update sites configurations done!`));
        }else{
            console.log(chalk.red(`>> error: Failed to update sites configurations`));
        }
        console.log(`>> process exit code ${code}`);
    });
    path =`${repoLocalPath}/${repoName}`;
    return path
}

async function load(config_path){
    let config = null;
    try{
        config_path = config_path || 'config.json'
        config = JSON.parse(fs.readFileSync(config_path));
        config.publishtools.root = await utils.resolvePath(config.publishtools.root)
        config.hyperdrive.path = await utils.resolvePath(config.hyperdrive.path)
        config.publishtools.sitesConfigPath = await updateSitesConfig(config)
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
         this.updateSitesConfig = updateSitesConfig
    }
}

module.exports = new Config()