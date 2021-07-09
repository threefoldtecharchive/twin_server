const fs = require('fs')
const p = require('process')
const chalk = require('chalk');

const config = require("./config");

async function process(){
    
    var letsencrypt = {}
    var seendomains = new Set()

    for(var alias in config.info.websites){
        var domains = config.info.websites[alias].domains
        for(var i=0; i < domains.length; i++){
            var domain = domains[i]
            seendomains.add(domain)
        }
    }

    for(var alias in config.info.wikis){
        var domains = config.info.wikis[alias].domains
        for(var i=0; i < domains.length; i++){
            var domain = domains[i]
            seendomains.add(domain)
        }
    }

    seendomains = Array.from(seendomains)

    for(var j=0; j<seendomains.length; j++){
        var domain = seendomains[j]
        letsencrypt[domain] = {"renewAt": 1, "altnames": [domain]}
    }

     try{
        fs.statSync('greenlock.d/config.json')
     }catch(e){
        fs.copyFileSync('greenlock.d/config.json.bak', 'greenlock.d/config.json');
     }
    var c = {}
    try{
        c = JSON.parse(fs.readFileSync('greenlock.d/config.json'));
    }catch(e){
        console.log(chalk.red(`X (Let'sEncrypt) Failed to read config file greenlock.d/config.json`))
        c = JSON.parse(fs.readFileSync('greenlock.d/config.json'));
    }

    for (var i=0; i< c.sites.length; i++){
        
        var site = c.sites[i]
        
        if (!(site.subject in letsencrypt)){continue}
        letsencrypt[site.subject].renewAt = site.renewAt
    }

    c.sites = []

    for(item in letsencrypt){
        if(item == "localhost" || item == "127.0.0.1"){
            continue
        }

        var obj = {}
        obj.subject = item
        obj.altnames = letsencrypt[item].altnames
        obj.renewAt = letsencrypt[item].renewAt
        c.sites.push(obj)
    }

    try{
        fs.writeFileSync('greenlock.d/config.json', JSON.stringify(c, null, 4), {flag: 'w'})
    }catch(e){
        console.log(chalk.red(`X (Let'sEncrypt) Failed to write config file greenlock.d/config.json`))
        p.exit(1)
    }
}

module.exports = {
    process : process
}