const express = require('express');
var session = require('express-session')

const mustacheExpress = require('mustache-express');
const config = require('../config')

const cors = require('cors');
const sites = require('./web/sites')
const threebot = require('./web/threebot')
const admin = require('./api/admin')
var morgan = require('morgan')

var path = require('path')
var rfs = require('rotating-file-stream')
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const {initAll, httpLogger, errorMiddleware, routes} = require("@threefoldjimber/digitaltwin-backend")

let app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(
    morgan('short', {
        stream: {
            write: (text) => {
                if (httpLogger?.http)
                    httpLogger.http(text);
                else console.log(text)
            },
        },
    }),
);

app.use(errorMiddleware);

// app.enable('trust proxy');
app.set('trust proxy', 1);

app.use(
    session({
        name: 'sessionId',
        secret: 'secretpassphrase',
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            path: '/',
            httpOnly: false,
            secure: false,
        },
    }),
);

app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({limit: '100mb', extended: false}));
app.use(bodyParser.json({limit: '100mb'}));

app.use(
    fileupload({
        useTempFiles: true,
        parseNested: true,
    }),
);

app.use('/api/', routes);
//Reading data
initAll();

// Session
var sess = {
    secret: config.http.session.secret,
    cookie: {},
    resave: true,
    saveUninitialized: true
}

if (config.nodejs.production) {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

// logging (rotating fs)
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '..', 'logs')
})

app.use(morgan('combined', {stream: accessLogStream}))

// req info
app.use(function (req, res, next) {
    var port = 443
    var host = ""

    if (req.headers.host) {
        host = req.headers.host
        var splitted = req.headers.host.split(':')
        if (splitted.length > 1) {
            port = splitted[1]
            host = splitted[0]
        }
    }

    if (host === "") {
        return res.status(400).json('Host Header is missing');
    }

    if (req.url.startsWith('/threebot')) {
        if (req.session.authorized) {
            return res.status(201)
        }

        next()
        return
    }

    if (req.url.startsWith('/logout')) {
        next()
        return
    }


    var info = null

    if (host == 'localhost') {
        info = config.info.websites['digitaltwin']
    } else {
        info = config.info.domains[host]
        if (!info) {
            return res.status(404).render('sites/404.mustache')
        }
    }

    // @todo: replace with proper redirection in config
    if (req.url == '/legal.md' || req.url == '/legal' || req.url == '/info/threefold/legal.md' || req.url == '/info/threefold/legal') {
        res.writeHead(302, {
            'Location': req.url.replace('legal', 'legal__legal')
        });
        return res.end();
    }

    if (req.url.startsWith('/login')) {
        var suburl = req.query.next.replace(/^\/|\/$/g, ''); //replace lading, trailing slash
        var alias = ""
        var splitted = suburl.split("/")
        alias = splitted[0]

        if (host == 'localhost') {
            info = config.info.websites['digitaltwin']
        } else {
            info = config.info.domains[host]
        }

        if (splitted.length == 1) {
            alias = splitted[0]
            if (config.info.websites[alias]) {
                info = config.info.websites[alias]
            }
        } else {
            if (splitted[0] == 'info') {
                alias = splitted[1].replace("#", "")
                if (config.info.websites[alias]) {
                    info = config.info.websites[alias]
                }
            } else {
                alias = splitted[0]
                if (config.info.websites[alias]) {
                    info = config.info.websites[alias]
                }
            }
        }

        if (!info) {
            return res.status(404).render('sites/404.mustache')
        }


    } else if (req.url != '/') {
        var found = false
        for (var alias in config.info.websites) {
            if (req.url == `/${alias}` || req.url.startsWith(`/${alias}/`)) {
                info = config.info.websites[alias]
                found = true
                break
            }
        }

        if (!found) {

            for (var alias in config.info.wikis) {
                var u = req.url.replace('/info/', '')
                var s = u.split("/")
                if (s[0] == alias) {
                    info = config.info.wikis[s[0]]
                    found = true
                    break
                }
            }
        }

        // threefold.io/blog   it is not website that is pathprefixed
        if (!found) {
            info = Object.assign({}, info)
            info.subPath = true
        }
    }

    if (!info) {
        return res.status(404).render('sites/404.mustache')
    }
    req.info = info
    req.info.host = host
    req.info.port = port
    req.info.secure = req.secure
    req.info.url = req.url
    next()
    return
})

app.use((req, res, next) => {
    if (req.url.startsWith('/threebot') || req.url.startsWith('/logout')) {
        next()
        return
    }
    var info = req.info

    var requirePassword = false
    var threebotConnect = false

    if (!info.acls) {

        return res.status(404).render('sites/404.mustache')
    }

    if (Object.keys(info.acls.secrets).length !== 0) {
        requirePassword = true
        req.session.requirePassword = true
        req.session.save()
    }

    if (Object.keys(info.acls.users).length !== 0) {
        threebotConnect = true
        req.session.threebotConnect = true

        req.session.save()
    }

    if (requirePassword || threebotConnect) {
        if (req.session.authorized) {

            next()
            return
        } else {
            if (!req.url.startsWith('/login')) {
                return res.redirect(`/login?next=${req.url}`)
            }
            next()
        }
    } else {
        next()
        return
    }
})


// stellar.toml
app.use((req, res, next) => {

    if (req.url == '/.well-known/stellar.toml') {
        stellar = `[[CURRENCIES]]
code = "TFT"
issuer = "GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47"
display_decimals = 2
name = "Threefold Token"
desc = "A digital currency used to buy autonomous and decentralized Internet services (compute, storage, and application) on the ThreeFold Network"
image = "https://raw.githubusercontent.com/threefoldfoundation/www_threefold_io/development/src/favicon.png"

[[CURRENCIES]]
code = "TFTA"
issuer = "GBUT4GP5GJ6B3XW5PXENHQA7TXJI5GOPW3NF4W3ZIW6OOO4ISY6WNLN2"
display_decimals = 2
name = "Threefold Token"
desc = "A digital currency used to buy autonomous and decentralized Internet services (compute, storage, and application) on the ThreeFold Network"
image = "https://raw.githubusercontent.com/threefoldfoundation/www_threefold_io/development/src/favicon.png"
`
        res.set('Content-Type', 'text/plain');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(stellar)
        return
    } else {
        next()
    }
})

//ACLS
app.use((req, res, next) => {
    if (req.session.authorized && !req.url.startsWith('/logout')) {
        var info = req.info
        if (req.session.authorization_mechanism == 'password') {
            var pass = req.session.used_pass
            var acl = info.acls.secrets[pass]

            if (Object.keys(info.acls.secrets).length !== 0 && !acl) {
                return res.status(401).render("sites/unauthorized.mustache", {
                    'next': req.url
                })
            }
        } else if (req.session.authorization_mechanism == '3bot') {
            var user = req.session.user.profile.doubleName.replace('.3bot', '')
            var acl = info.acls.users[user]

            if (Object.keys(info.acls.users).length !== 0 && !acl) {
                return res.status(401).send(`Un authorized <a href="/logout?next=${req.url}">Login again with different user</>`)
            }
        }
    }
    next()
    return
})

app.use(express.json());
app.use(threebot)
app.use("/admin", admin)
app.use(sites);
app.use(cors({origin: '*', optionsSuccessStatus: 200}));

module.exports = app
