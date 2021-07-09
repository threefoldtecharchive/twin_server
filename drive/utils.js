var path = require('path')
const chalk = require('chalk');
const groups = require('./groups')
var utils = require('../utils')


async function process(drive, dir){
    var p = path.join("/", dir)

    var configfilepath = path.join("..", p, "sites.json")
    try{
        await drive.promises.stat(configfilepath)
        
    }catch(e){
        console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignored (missing site.json)`))
        return
    }

    var sitesConfig = {}
    var sitegroups = {}

    try{
        var data = await  drive.promises.readFile(configfilepath, 'utf8', false);
        data = JSON.parse(data)
        
        for(var i=0; i <data.length; i++){
            var item = data[i]
            var url = item.url.split("/")
            var isWebsite = item.cat == 2
            var isWiki = item.cat == 0
            var name = url[url.length-1].replace(".git", "")
            if(isWebsite){
                name = name
            }else if (isWiki){
                name = `wiki_${item.shortname}`
            }else{
                continue
            }

            item.repo = url[url.length-1]
            sitesConfig[name] = item
            for (var k=0; k<sitesConfig[name].groups.length; k++){
                var g = sitesConfig[name].groups[k]
                if (!(g.name in sitegroups)){
                    sitegroups[g.name] = {"users": g.members_users, "groups": g.members_groups}
                }
            }   
        }
    }catch(e){
        console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignored (error parsing sites.json)`))
        return
    }
    var info = {"websites": {}, "wikis": {}}
    var domains = {}

    var dirs = await drive.promises.readdir(p)
    
    var groupObj = await groups.load(sitegroups)
    
    dirs = dirs.filter((item) => {if(!item.startsWith(".")){return item}}).sort()

    var defs = {}
    for(var i=0; i < dirs.length; i++){
        if(! (dirs[i] in sitesConfig)){
            console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignored repo ${dirs[i]} (no config for this repo in sites.json)`))
            continue
        }

        var dir = path.join(p, dirs[i])

        var siteinfo = sitesConfig[dirs[i]]

        var isWebSite = siteinfo.name.startsWith("www")

        var item =  isWebSite? "websites" : "wikis"

        var alias = siteinfo.shortname

        if (alias in info[item]){
            console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignoring path: ${dir} duplicated alias`))
            continue
        }

        // load defs from wikis
        if(!isWebSite){
            try{
                var defpath = path.join(dir, 'defs.json')
                var defdata = await  drive.promises.readFile(defpath, 'utf8', false);
                defInfo = JSON.parse(defdata)
                for(var k=0; k< defInfo.defs.length; k++){
                    var obj = defInfo.defs[k]
                    defs[obj.def] = {"wikiname": obj.site, "pagename": obj.page}
                }
            }catch(e){
                console.log(chalk.red(`    ✓ (Drive (${drive.name}) Ignoring path: ${dir} Error reading: ${defpath}`))
            }
        }
        var acls = await groupObj.parseAcl(siteinfo.acl)
        var val = {
            "drive": drive,
            "dir": dir,
            "repo": siteinfo.repo,
            "alias": siteinfo.shortname,
            "isWebSite": isWebSite,
            "acls": acls,
            "domains": siteinfo.domains,
            "subPath": false
        }
        info[item][alias] = val

        for(var k=0; k < siteinfo.domains.length; k++){
            var domain = siteinfo.domains[k]
            domains[domain] = val
        }
    }
    info["defs"] = defs
    info["domains"] = domains
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
    var res = {"websites": {}, "wikis": {}, "defs": {}, "domains": {}}
    
    for(var i=0; i<items.length; i++){
        var obj = items[i]
        
        for(var def in obj.defs){
            res.defs[def] = obj.defs[def]
        }

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
