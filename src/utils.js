const process = require('process')
const path = require('path')
var rewrite = require('./rewrite')


// Resolve path with ~
async function resolvePath(filepath){
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

async function addRewriteRuleForDomains(domain, alias, isWebsite){

  
    rewrite[`https://${domain}`] = alias    
    
    rewrite[`http://${domain}`] = alias    
    if(domain.startsWith('www')){
        var d = domain.replace('www.', '')
        rewrite[`https://${d}`] = alias    
        rewrite[`http://${d}`] = alias    
    }
}

class Utils{
    constructor(){
        this.resolvePath = resolvePath
        this.addRewriteRuleForDomains = addRewriteRuleForDomains
    }
}

module.exports = new Utils()