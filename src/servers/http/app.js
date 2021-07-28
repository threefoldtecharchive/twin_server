const express = require('express');
var session = require('express-session')

const mustacheExpress = require('mustache-express');
const config = require('../../config')

const cors = require('cors');
const sites = require('./api/sites')
const threebot = require('./api/threebot')
const admin = require('./api/admin')
var morgan = require('morgan')

var path = require('path')
var rfs = require('rotating-file-stream')
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload')
const {initAll, httpLogger, errorMiddleware, routes} = require("@threefoldjimber/digitaltwin-backend")
const {aclsMiddleware, stellarMiddleware, loginMiddleware, requestInfoMiddleware} = require("./api/middlewares")
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
app.use(requestInfoMiddleware)
app.use(loginMiddleware)
app.use(stellarMiddleware)
app.use(aclsMiddleware)
app.use(express.json());
app.use(threebot)
app.use("/admin", admin)
app.use(sites);
app.use(cors({origin: '*', optionsSuccessStatus: 200}));

module.exports = app
