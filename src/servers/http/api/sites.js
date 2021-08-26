const chalk = require('chalk');
var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler')
const config = require('../../../config')
const server = require('../../../server')

const logger = require('../../../logger')
const path = require('path')
var axios  = require('axios')
var fs = require('fs');
const { spawn } = require("child_process");

async function getContent(filepath, httppath, encoding, info){
    console.log(`+++getting content for ${filepath} ${httppath}`)
    var content = ""
    if (!process.env.WIKI_FS){
        
        var options =  {}
        
        if(encoding == 'binary'){
            options = {responseType :'arraybuffer'}
        }
        await axios.get(`http://localhost:${config.http.publishtoolsPort}/info`+httppath, options).then(response => {
            content = response.data
            if(encoding != 'binary')
                content = await(rewriteRoles(content, info))
        }).catch(error => {
            if(error.response){
                throw new Error("not found")
            }
        });
        return content
    }else{
        try{
            driveObj = info.drive
            entry = await driveObj.promises.stat(filepath)
            var content = await  driveObj.promises.readFile(filepath, encoding, true);
            if(encoding != 'binary')
                content = await(rewriteRoles(content, info))
            
        }catch(e){
            console.log(e)
            if(e.response){
                throw new Error("not ound")
            }
        }
        return content
    }
}
    

async function rewriteRoles(content, info){
    
    var scheme = info.secure ? 'https' : 'http'

    host = `${scheme}://${info.host}`
    if(info.port != 80 && info.port != 443){
        host = `${scheme}://${info.host}:${info.port}`
    }

    var mainDomains = info.domains
    var mainRepo  = info.repo
       
    if (info.host == 'localhost' || info.host == '127.0.0.1' || host.endsWith('gitpod.io')){
        for(var item in config.info.domains){
            var site = config.info.domains[item]
            var isWebsite = site.isWebSite
    
            var prefix = ""
    
            if(mainDomains.includes(item) || site.repo == mainRepo){
                prefix = "/"
            }else if(isWebsite){
                prefix = `/${site.alias}`
            }else{
                prefix = `/info/${site.alias}`
            }  
            content = content.replace(new RegExp(`https://${item}/`, "g"), `${host}${prefix}`)
            content = content.replace(new RegExp(`https://${item}`, "g"), `${host}${prefix}`)
            content = content.replace(new RegExp(`http://${item}/`, "g"), `${host}${prefix}`)
            content = content.replace(new RegExp(`http://${item}`, "g"), `${host}${prefix}`)
            if(site.alias == "aydo"){
                content = content.replace(new RegExp(`/${site.alias}/`, "g"), "/")
            }
            
        }
    }else{
        var site = config.info.domains[info.host]
        var isWebsite = site.isWebSite
        content = content.replace(new RegExp(`/${site.alias}/`, "g"), "/")
    }

    // fix pdf & zip files in wikis
    var splitted = info.url.split("/")
    splitted.pop()
    var prefix = splitted.join("/")
    content = content.replace(/href="([^\"]+\.pdf)"/g, `href="${prefix}/$1"`)
    content = content.replace(/href="([^\"]+\.zip)"/g, `href="${prefix}/$1"`)

    return content
}

async function update(req) {
    var info = req.info
    var repo = info.repo

    var spawn = require('child_process').spawn;
    var prc = spawn('publishtools',  ['pull', '--repo', repo]);
    
    //noinspection JSUnresolvedFunction
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        logger.info(`${req.method} - ${lines.join("")}  - ${req.originalUrl} - ${req.ip}`);
    });

    prc.on('close', function (code) {
        logger.info(`${req.method} - process exit code ${code}  - ${req.originalUrl} - ${req.ip}`);
    });
    
    spawn2 = require('child_process').spawn;
    
    if (repo.startsWith("www")){
        var prc2 = spawn('publishtools',  ['build', '--repo', repo, '--pathprefix']);
    }else{
        var prc2 = spawn('publishtools',  ['flatten', '--repo', repo, '--pathprefix']);
    }
    //noinspection JSUnresolvedFunction
    prc2.stdout.setEncoding('utf8');
    prc2.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        logger.info(`${req.method} - ${lines.join("")}  - ${req.originalUrl} - ${req.ip}`);
    });

    prc2.on('close', function (code) {
        logger.info(`${req.method} - process exit code ${code}  - ${req.originalUrl} - ${req.ip}`);
    });

}

async function handleWebsiteFile(req, res, info){
    driveObj = info.drive
    var url = req.url.replace(`/${info.alias}/`, "").toLowerCase()
    var filepath = `${info.dir}/${url}`
    
    
    var encoding = 'utf-8'
    if(filepath.endsWith('png')){
        res.type("image/png")
        encoding = 'binary'
    }else if(filepath.endsWith('jpg')){
        res.type("image/jpg")
        encoding = 'binary'
    }else if(filepath.endsWith('jpeg')){
        encoding = 'binary'
        res.type('image/jpeg')
    }else if(filepath.endsWith('svg')){
        encoding = 'binary'
        res.type('image/svg+xml')
    }else if (filepath.endsWith("js")){
        res.type("application/javascript");
    }else if (filepath.endsWith("css")){
            res.type("text/css");
    }else if (filepath.endsWith("json")){
        res.type("application/json");
    }else if(filepath.endsWith('pdf')){
        encoding = 'binary'
        res.type('application/pdf')
    }else if(filepath.endsWith('zip')){
        encoding = 'binary'
        res.type('application/zip')
    }
    var entry = null
    try {
        try{
            entry = await driveObj.promises.stat(filepath)
        }catch(e){
            filepath = info.dir + "/index.html"

            entry = await driveObj.promises.stat(filepath)
        }
 
        if(entry.isDirectory()){
            filepath = filepath + "/index.html"
            entry = await driveObj.promises.stat(filepath)
        }

        var content = await  driveObj.promises.readFile(filepath, encoding, true);
        if(encoding != 'binary')
            content = await(rewriteRoles(content, info))
        return res.send(content)
    } catch (e) {
        logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
        // return res.status(404).send(`File not found : ${filepath}`);
        return res.status(404).render('sites/404.mustache')
    }
}

async function handleWikiFile(req, res, info){
    var filename = req.url.replace(`/info`, "").replace(`/${info.alias}/`, "").toLowerCase()
    var wikiname = info.dir.substring(1)
    console.log(`wikiname ${wikiname} file is ${filename}`)

    if (filename.startsWith('/')){
        filename = filename.substring(1)
    }

    if(filename.includes("__")){
        var splitted = filename.split("__")
        filename = splitted[1]
        wikiname = `wiki_${splitted[0]}` 
    }
 
    var encoding = 'utf-8'  
    
    if (filename == "_sidebar.md"){
        filename = "sidebar.md"
    }

    if (filename == "_navbar.md"){
        filename = "navbar.md"
    }

    if (filename == "README.md"){
        filename = "readme.md"
    }
    
    var splitted = filename.split("/")
    if (splitted.length > 1){
        filename = splitted[splitted.length - 1]
    }

    if(filename.endsWith('png')){
        res.type("image/png")
        encoding = 'binary'
    }else if(filename.endsWith('jpg')){
        res.type("image/jpg")
        encoding = 'binary'
    }else if(filename.endsWith('jpeg')){
        encoding = 'binary'
        res.type('image/jpeg')
    }else if(filename.endsWith('svg')){
        encoding = 'binary'
        res.type('image/svg+xml')
    }else if(filename.endsWith('pdf')){
            encoding = 'binary'
            res.type('application/pdf')
    }else if(filename.endsWith('ico')){
        encoding = 'binary'
        res.type('image/x-icon')
    }else if(filename.endsWith("md") ){
        encoding = 'utf-8'  
    }else if (path.extname(filename) == ''){
        filename = `${filename}.md`
    }else if(filename.endsWith('zip')){
        encoding = 'binary'
        res.type('application/zip')
    }

    filepath = `/${wikiname}/${filename}`
    driveObj = null
    for(var alias in config.info.wikis){
        var item = config.info.wikis[alias]
        if(item.dir == `/${wikiname}`){
            driveObj =  item.drive
        }
    }

    if(!driveObj){
        // return res.status(404).send(`Wiki not found`)
        return res.status(404).render('sites/404.mustache')
    }

    // `/${req.params.wikiname}/${req.params.filename}`
    var entry = null
    httppath = filepath.replace('wiki_', '')
    var content = null

    try{
        content =  await getContent(filepath, httppath, encoding, info)
    }catch(e){

        httppath = filepath.replace('wiki_', '')
        try{
            content =  await getContent(filepath, httppath, encoding, info)
        }catch(e){
            console.log("could not find " + httppath)
        }
    }
    if(content){
        console.log("got content")
        if (encoding == 'binary'){
            content = Buffer.from(content, 'binary')
        }
        
        return res.send(content)
    }else{
        console.log("no content")
        return res.status(404).render('sites/404.mustache')

    }
}

router.get('/login', asyncHandler(async (req, res) =>  {
    
    return res.render('sites/login.mustache', {
        'requirePassword': req.session.requirePassword,
        'require3botConnect': req.session.threebotConnect,
        'next': req.query.next
    })
}))

router.post('/login', asyncHandler(async (req, res) =>  {
    var info = req.info
    var body = req.body
    if (body && body.psw){
        if (body.psw in info.acls.secrets){
            req.session.authorized = true
            req.session.authorization_mechanism = 'password'
            req.session.used_pass = body.psw
            req.session.save()
            return res.redirect(req.query.next)
        }
    }
    return res.redirect(`/login?next=${req.query.next}`)
}))

router.get('/logout', asyncHandler(async (req, res) =>  {
    req.session.destroy();
    return res.redirect(req.query.next)
}))


// Home (list of wikis and sites)
router.get('/publishtools/list', asyncHandler(async (req, res) =>  {
        var info = req.info
        var domains = []

        var wikis = new Set()
        var sites = new Set()

        for(var w in config.info.websites){
            var item = config.info.websites[w]
            var d = `${info.host}`
            if(info.port != 80 && info.port != 443){
                d = `${d}:${info.port}`
            }
            if(w == '/'){
                w = ""
            }

            sites.add({"name": item.alias, "url": `${d}/${w}`})
        }

        for(var w in config.info.wikis){
            var item = config.info.wikis[w]
            var d = `${info.host}`
            if(info.port != 80 && info.port != 443){
                d = `${d}:${info.port}`
            }
            if(w == '/'){
                w = ""
            }

            wikis.add({"name": item.alias, "url": `${d}/info/${w}`})
        }

        domains.push({"domain": info.host, "websites": Array.from(sites), "wikis": Array.from(wikis)})

        res.render('sites/home.mustache', {
            domains : domains,
            port: info.port
        });       
    }
))

router.get('/', asyncHandler(async (req, res) =>  {
    var info = req.info
     var driveObj = info.drive
     var dir = info.dir
     var filepath = `${dir}/index.html`
    
     try {
         entry = await driveObj.promises.stat(filepath)
         
         var content = await  driveObj.promises.readFile(filepath, 'utf8', true);
         content = await(rewriteRoles(content, info))
         return res.send(content)
     } catch (e) {
            logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
            // return res.status(404).send(`Site not found : ${info.alias}`);
            return res.status(404).render('sites/404.mustache')
     }    
}))

router.get('/info', asyncHandler(async (req, res) =>  {
    var info = req.info
        var domains = []

        var wikis = new Set()

        for(var w in config.info.wikis){
            var item = config.info.wikis[w]
            var d = `${info.host}`
            if(info.port != 80 && info.port != 443){
                d = `${d}:${info.port}`
            }
            if(w == '/'){
                w = ""
            }

            wikis.add({"name": item.alias, "url": `${d}/info/${w}`})
        }

        domains.push({"domain": info.host, "websites": [], "wikis": Array.from(wikis)})

        res.render('sites/home.mustache', {
            domains : domains,
            port: info.port
        });       
    
}))

router.get('/:path', asyncHandler(async (req, res) =>  {
     if(req.params.path == 'update'){
        await update(req)
        return res.redirect('/')
     }

     var info = req.info

    if (info.isWebSite){
        var driveObj = info.drive
        var dir = info.dir
        var filepath = ""

        // /blog, /team
        if(info.subPath){
            filepath = `${dir}${req.url}/index.html`
        }else{
            // /cloud (pathprefixed site)
            filepath = `${dir}/index.html`
        }

        filepath = filepath.toLowerCase()
        
        var entry = null
        try {
            try{
                entry = await driveObj.promises.stat(filepath)
            }catch(e){
                if(info.subPath){
                   filepath = `${dir}/index.html`
                    entry = await driveObj.promises.stat(filepath)
                }
            }
            
            var content = await  driveObj.promises.readFile(filepath, 'utf8', true);
            content = await rewriteRoles(content, info)
            return res.send(content)
        } catch (e) {
            logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
            // return res.status(404).send(`File not found : ${filepath}`);
            return res.status(404).render('sites/404.mustache')
        }
    // static file for wikis or wiki file
    }else{

        var name = req.params.path
        var driveObj = req.info.drive
        var filepath = ""
        contenttype = 'utf8'

        if (name.endsWith("js") || name.endsWith("css")){   
            filepath = path.join('..', 'static', name)
            if (name.endsWith('js'))
                res.type("text/javascript")
            else if  (name.endsWith('css'))
                res.type("text/css")

            var entry = null
            try {
                
                entry = await driveObj.promises.stat(filepath)
                var content = await  driveObj.promises.readFile(filepath, 'utf8', true);
                return res.send(content)
            } catch (e) {
                logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
                // return res.status(404).send(`File not found : ${filepath}`);
                return res.status(404).render('sites/404.mustache')
            }
        }else{
            return handleWikiFile(req, res, info)
        }
    }
}))

router.get('/info/:wiki', asyncHandler(async (req, res) =>  {
    var name = req.params.wiki.toLowerCase() 
    var filepath = ""
    contenttype = 'utf8'
    var dir = req.info.dir
    var driveObj = req.info.drive
    console.log("filepath: " + filepath + ", name: " + name)
    if (name.endsWith("js") || name.endsWith("css") || name.endsWith("ico")){   
        if (name.endsWith('js'))
            res.type("text/javascript")
        else if  (name.endsWith('css'))
            res.type("text/css")

        filepath = path.join('..', 'static', name)
        
        var entry = null
        try {
            
            entry = await driveObj.promises.stat(filepath)
            var content = await  driveObj.promises.readFile(filepath, 'utf8', true);
            return res.send(content)
        } catch (e) {
            logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
            // return res.status(404).send(`File not found : ${filepath}`);
            return res.status(404).render('sites/404.mustache')
        }

    }else{
        filepath = `${dir}/index.html`
    }
        
    var entry = null
    try {
        
        httppath = filepath.replace('wiki_', '')
        content =  await getContent(filepath, httppath, 'utf-8', req.info)
        return res.send(content)
    } catch (e) {
        console.log(e)
        logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
        // return res.status(404).send(`File not found : ${filepath}`);
        return res.status(404).render('sites/404.mustache')
    }
}))



router.get('/:website/flexsearch', asyncHandler(async (req, res) => {
    var info = req.info

    if(info.status != 200){
        return res.status(info.status).send(info.err);
    }

    var driveObj = info.drive
    var filepath = `${info.dir}/flexsearch.json`
    var entry = null
    try {
        entry = await driveObj.promises.stat(filepath)
        var content = await  driveObj.promises.readFile(filepath, 'utf8');
        res.type("application/json");
        return res.send(content)
    } catch (e) {
        logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
        // return res.status(404).send(`File not found : ${filepath}`);
        return res.status(404).render('sites/404.mustache')
    }
}))

// Wiki errors
router.get('/info/:wiki/errors', asyncHandler(async (req, res) => {
    var info = await req.info

    var driveObj = info.drive
    var wikiname = info.dir.substring(1)
    
    filepath = `${info.dir}/errors.json`
    try {
        entry = await driveObj.promises.stat(filepath)

        var content = await  driveObj.promises.readFile(filepath, 'utf-8', true) ;
        
        var data = JSON.parse(content)
        var errors = {
            page_errors : []
        }
        errors.site_errors = data.site_errors
        
        for (var key in data.page_errors){
            var e = {
                page : key,
                errors : data.page_errors[key]
            }
            errors.page_errors.push(e)
        }
        res.render('sites/errors.mustache', {site_name: wikiname, site_errors : errors.site_errors, page_errors: errors.page_errors});
       
    } catch (e) {
        logger.error(`${req.method} - ${e.message}  - ${req.originalUrl} - ${req.ip}`);
        // return res.status(404).send(`File not found : ${filepath}`);
        return res.status(404).render('sites/404.mustache')
    }
}))


router.get('/info/:wiki/update', asyncHandler(async (req, res) => {
    await update(req)
    return res.redirect(`/info/${req.params.wiki}`)
}))

router.get('/:website/update', asyncHandler(async (req, res) => {
    await update(req)
    return res.redirect(`/${req.params.website}`)
}))

// wiki files
router.get('/info/:wiki/*', asyncHandler(async (req, res) => {
    var info = req.info
    return handleWikiFile(req, res, info)
}))

// website files
router.get('/:website/*', asyncHandler(async (req, res) => {
    var info = req.info

    if (info.isWebSite){
        return handleWebsiteFile(req, res, info)
    }else{
        return handleWikiFile(req, res, info)
    }
}))

/* No Need for adding new config for now
router.post('/wikis', asyncHandler(async (req, res) => {
    data = req.body
    console.log("WIKI POST DATA::")
    console.log(data)
    tmpDir = '/tmp/publishtools'
    if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(`${tmpDir}/site_wiki_tmp.json`, JSON.stringify(data));
    var addWiki = spawn(`
    . /workspace/env.sh;
    cd /tmp/publishtools;
    echo "### Publishtools install ###";
    publishtools install;
    echo "### Publishtools flatten ###";
    publishtools flatten;` , {shell: "/bin/bash"});

    addWiki.stdout.setEncoding('utf8');
    addWiki.stdout.on('data', function (data) {
        console.log(`- stdout: add new wiki: ${data}`)
    });

    addWiki.stderr.on('data', function (data) {
        console.log(`- stderr: add new wiki: ${data}`)
    });

    addWiki.on('close', function (code) {
        // Delete tmp config file
        fs.unlinkSync(`${tmpDir}/site_wiki_tmp.json`)
        if (code == 0) {
            res.send('{"success": true}')
            console.log(chalk.green('✓ Done adding wiki'))
        }
        console.log("Reload Server Config")
        server.init();
        console.log(`process exit code ${code}`);
    });
    
}))

router.post('/sites', asyncHandler(async (req, res) => {
    data = req.body
    console.log("SITE POST DATA::")
    console.log(data)
    tmpDir = '/tmp/publishtools'
    if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(`${tmpDir}/site_tmp.json`, JSON.stringify(data, null, 2));
    var addSite = spawn(`
    . /workspace/env.sh;
    cd /tmp/publishtools;
    echo "### Publishtools install ###";
    publishtools install;
    echo "### Publishtools build ###";
    echo "Website building, It may take a time ......";
    publishtools build;` , {shell: "/bin/bash"});

    addSite.stdout.setEncoding('utf8');
    addSite.stdout.on('data', function (data) {
        console.log(`- stdout: add new site: ${data}`)
    });

    addSite.stderr.on('data', function (data) {
        console.log(`- stderr: add new site: ${data}`)
    });

    addSite.on('close', function (code) {
        // Delete tmp config file
        fs.unlinkSync(`${tmpDir}/site_tmp.json`)
        if (code == 0){
            res.send('{"success": true}')
            console.log(chalk.green('✓ Done adding site'))
        }
        console.log("Reload Server Config")
        server.init();
        console.log(`process exit code ${code}`);
    });
}));
*/
router.post('/update', asyncHandler(async (req, res) => {
    data = req.body;
    console.log(data);
    var update = null
    console.log(chalk.yellow('- Updating ....'))
    config.updateSitesConfig()

    // Check if request data is empty
    if (Object.keys(data).length == 0){
        console.log(chalk.red(`- error: Missing data in the request`));
        res.send("status": false, "msg": "Missing data in the request");
        return res.status(400);
    }

    for (dir in data){
        dirPath = `${config.publishtools.sitesConfigPath}/${dir}`
        if (fs.existsSync(dirPath)){
            elements = data[dir]
            // Check if elements is empty, install, flatten and build for all files in dir
            if (elements.length == 0){
                console.log(chalk.yellow(`- Updating dir: ${dirPath}`))
                update = spawn(`
                . /workspace/env.sh;
                cd ${dirPath};
                echo "### Publishtools install ###";
                publishtools install;
                echo "### Publishtools flatten ###";
                publishtools flatten;
                echo "### Publishtools build ###";
                echo "Website building, It may take a time ......";
                publishtools build;` , {shell: "/bin/bash"})
            }else{
                // List all files in this dir
                elements.sort((element1, element2) => {
                    if (element1.includes("_wiki_")){
                        return -1
                    }else{
                        return 1
                    }
                })
                listDir = fs.readdirSync(dirPath)
                for (element of elements){
                    // Check if the element is in this dir
                    if (element in listDir){
                        console.log(chalk.yellow(`Updating ${dirPath}/${element}`));
                        // Get config name
                        f = fs.readFileSync(`${dirPath}/${element}`);
                        elementJson = JSON.parse(f);
                        if element.includes("_wiki_"){
                            cmd = `
                            . /workspace/env.sh;
                            cd ${dirPath};
                            echo "### Publishtools install ###";
                            publishtools install;
                            echo "### Publishtools flatten ###";
                            publishtools flatten --repo ${elementJson.name};
                            `
                        }else{
                            cmd = `
                            . /workspace/env.sh;
                            cd ${dirPath};
                            echo "### Publishtools install ###";
                            publishtools install;
                            echo "### Publishtools build ###";
                            publishtools build --repo ${elementJson.name};
                            `
                        }
                        update.spawn(cmd, {shell: "/bin/bash"})
                        res.send("status": true);
                    }else{
                        console.log(chalk.red(`Wrong File, ${dirPath}/${element} not exist`))
                    }
                }
            }
        }else{
            console.log(chalk.red(`Wrong directory, ${dirPath} not exist`))
        }
    }

    update.stdout.setEncoding('utf8');
    update.stdout.on('data', function (data) {
        console.log(`>> ${data}`)
    });

    update.stderr.on('data', function (data) {
        console.log(chalk.red(`>> error: ${data}`))
    });

    update.on('close', function (code) {
        if (code == 0) {
            res.send('{"success": true}')
        }else{
            res.send('{"success": false}')
        }
        console.log("Reload Server Config")
        server.init();
        console.log(chalk.green(`Updates Done!`));
        console.log(`process exit code ${code}`);
    });
}));
module.exports = router
