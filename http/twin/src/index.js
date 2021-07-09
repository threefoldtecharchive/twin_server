"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const socketService_1 = require("./service/socketService");
const routes_1 = __importDefault(require("./routes"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("./logger");
const keyStore_1 = require("./store/keyStore");
const user_1 = require("./store/user");
const errorHandlingMiddleware_1 = __importDefault(require("./middlewares/errorHandlingMiddleware"));
require("./utils/extensions");
const tokenStore_1 = require("./store/tokenStore");
const yggdrasilService_1 = require("./service/yggdrasilService");
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};
const app = express_1.default();
const httpServer = http_1.default.createServer(app);
socketService_1.startSocketIo(httpServer);
app.use(morgan_1.default('short', {
    stream: {
        write: (text) => {
            logger_1.httpLogger.http(text);
        },
    },
}));
app.use(errorHandlingMiddleware_1.default);
app.use(cors_1.default(corsOptions));
// app.enable('trust proxy');
app.set('trust proxy', 1);
app.use(express_session_1.default({
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
}));
app.use(body_parser_1.default.raw());
app.use(body_parser_1.default.urlencoded({ limit: '100mb', extended: false }));
app.use(body_parser_1.default.json({ limit: '100mb' }));
app.use(express_fileupload_1.default({
    useTempFiles: true,
    parseNested: true,
}));
app.use('/api/', routes_1.default);
//Reading data
keyStore_1.initKeys();
user_1.initUserData();
tokenStore_1.initTokens();
yggdrasilService_1.initYggdrasil();
