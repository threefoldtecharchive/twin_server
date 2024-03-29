var path = require('path')
const chalk = require('chalk');
const groups = require('./groups')
var utils = require('../../../../utils')
const systemProcess = require('process')

async function process(drive, dir){
    var p = path.join("/", dir)

    var configDirPath = p
    
    try{
        await drive.promises.stat(configDirPath)
    }catch(e){
        console.log(chalk.red(`    X (Twin Server) missing config dir)`))
        systemProcess.exit(1)
    }

    var sitesConfig = {}
    var siteGroups = {}

    var files = await  drive.promises.readdir(configDirPath)
    
    var filename = ""
    try{

        for(var i=0; i <  files.length; i++){
            filename = files[i]
            var configFilePath =  path.join(configDirPath, filename)
            if(filename.startsWith("config_")){
                var data = await  drive.promises.readFile(configFilePath, 'utf8', false);
                var item = JSON.parse(data)
                var url = (item.raw && item.raw.git_url.split("/")) || item.git_url.split("/")
                
                var isWebsite = item.cat == "web" || item.cat == 2
                var isWiki = item.cat == "wiki" || item.cat == 0
                var name = item.name
                if(isWebsite){
                    name = `www_${item.name}`
                }else if (isWiki){
                    name = `wiki_${item.name}`
                }else{
                    continue
                }
                var tree = url.indexOf('tree')
                item.repo = url[tree-1]
                sitesConfig[name] = item
            }else if (filename.startsWith("groups_")){
                var data = await  drive.promises.readFile(configFilePath, 'utf8', false);
                var item = JSON.parse(data)
                for (var k=0; k<item.length; k++){
                    var g = item[k]
                    if (!(g.name in siteGroups)){
                        siteGroups[g.name] = {"users": g.members_users, "groups": g.members_groups}
                    }
                }
            }
        }


    }catch(e){
        console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignored (${filename})`))
        return
    }
    
    var info = {"websites": {}, "wikis": {}}
    var domains = {}

    var dirs = await drive.promises.readdir(p)
    var groupObj = await groups.load(siteGroups)
    // ignore wiki dirs (coming from publishtools now)
    dirs = dirs.filter((item) => {if(!item.includes(".") && !item.startsWith("wiki")){return item}}).sort()

    // process sites
    for(var i=0; i < dirs.length; i++){
        if(! (dirs[i] in sitesConfig)){
            if(`www_${dirs[i]}` in sitesConfig){
                var o = Object.assign({}, sitesConfig[`www_${dirs[i]}`])
              
                delete sitesConfig[`www_${dirs[i]}`]
                sitesConfig[dirs[i]] = o
            }else{
                console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignored repo ${dirs[i]} (no config file for this repo)`))
                continue
            }
        }
        

        
        var dir = path.join(p, dirs[i])
        
        var siteInfo = sitesConfig[dirs[i]]
        var isWebSite = siteInfo.cat == "web" || siteInfo.cat == 2

        var item =  isWebSite? "websites" : "wikis"

        var alias = siteInfo.prefix
        
        if (alias in info[item]){
            console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignoring path: ${dir} duplicated alias`))
            continue
        }
        var acls = await groupObj.parseAcl(siteInfo.acl)
        var val = {
            "drive": drive,
            "dir": dir,
            "repo": siteInfo.repo,
            "alias": alias,
            "isWebSite": isWebSite,
            "acls": acls,
            "domains": siteInfo.domains,
            "subPath": false
        }
        info[item][alias] = val

        for(var k=0; k < siteInfo.domains.length; k++){
            var domain = siteInfo.domains[k]
            domains[domain] = val
        }
    }
    // process wikis
    for(var wiki in sitesConfig){
        var siteInfo = sitesConfig[wiki]
        if(siteInfo.cat == "wiki" || siteInfo.cat == 0){
            var dir = path.join(p,  `wiki_${siteInfo.name}`)
            var alias = siteInfo.name

            var acls = await groupObj.parseAcl(siteInfo.acl)
            var val = {
                "drive": drive,
                "dir": dir,
                "repo": siteInfo.repo,
                "alias": siteInfo.name,
                "isWebSite": false,
                "acls": acls,
                "domains": siteInfo.domains,
                "subPath": false
            }
            info["wikis"][alias] = val

            for(var k=0; k < siteInfo.domains.length; k++){
                var domain = siteInfo.domains[k]
                domains[domain] = val
        }
        }
    }
    info["domains"] = domains
    // console.log(info)
    return info
}

async function loadInfo(drive){
    var dirs = await drive.promises.readdir("/")
    dirs = dirs.filter((item) => {if(!item.startsWith(".")){return item}}).sort()
    var items = []
    items.push(await process(drive, "."))
    return items
}

async function reduce(items){
    var res = {"websites": {}, "wikis": {}, "domains": {}}
    
    for(var i=0; i<items.length; i++){
        var obj = items[i]
        
        // for(var def in obj.defs){
        //     res.defs[def] = obj.defs[def]
        // }

        for(var d in obj.domains){
            res.domains[d] = obj.domains[d]
        }


        for(var alias in obj["websites"]){
            if(alias in res["websites"]){
                var driv = res["websites"][alias].drive
                var dir = res["websites"][alias].dir
                console.log(chalk.red(`    ✓ (Drive (${driv.name}) Ignoring path: ${dir} duplicate alias for domain ${domain}`))
                continue
            }else{
                res["websites"][alias] =  obj["websites"][alias]
                var domains = obj["websites"][alias].domains
                for(var j=0; j< domains.length; j++){
                    var domain = domains[j]
                    prefix = obj["websites"][alias].isWebSite? "/" : "/info/"
                    await utils.addRewriteRuleForDomains(domain, prefix+alias, true)
                }
            }
        }
        for(var alias in obj["wikis"]){
            if(alias in res["wikis"]){
                var driv = res["websites"][alias].drive
                var dir = res["websites"][alias].dir
                console.log(chalk.red(`    ✓ (Drive (${driv.name}) Ignoring path: ${dir} duplicate alias for domain ${domain}`))
                continue
            }else{
                res["wikis"][alias] =  obj["wikis"][alias]
                var domains = obj["wikis"][alias].domains
                for(var j=0; j< domains.length; j++){
                    var domain = domains[j]
                    prefix = obj["wikis"][alias].isWebSite? "/" : "/info/"
                    await utils.addRewriteRuleForDomains(domain, prefix+alias, false)
                }
            }
        }
    }
    return res
}

module.exports = {
    loadInfo: loadInfo,
    reduce: reduce
}