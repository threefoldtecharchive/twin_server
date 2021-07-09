"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_1 = require("../utils/files");
const httpError_1 = require("../types/errors/httpError");
const http_status_codes_1 = require("http-status-codes");
const authenticationMiddleware_1 = require("../middlewares/authenticationMiddleware");
const jwtService_1 = require("../service/jwtService");
const tokenStore_1 = require("../store/tokenStore");
const sync_request_1 = __importDefault(require("sync-request"));
const config_1 = require("../config/config");
const common_1 = require("../common");
const fs = __importStar(require("fs"));
const AdmZip = require('adm-zip');
const router = express_1.Router();
router.get('/directories/content', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let p = req.query.path;
    if (!p || typeof p !== 'string')
        p = '/';
    const path = new files_1.Path(p);
    const stats = yield files_1.getStats(path);
    console.log(stats);
    if (!stats.isDirectory() || stats.isBlockDevice() || stats.isCharacterDevice() || stats.isSymbolicLink() || stats.isSocket())
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Path is not a directory');
    res.json(yield files_1.readDir(path, { withFileTypes: true }));
}));
router.get('/directories/info', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let p = req.query.path;
    if (!p || typeof p !== 'string')
        p = '/';
    const path = new files_1.Path(p);
    const stats = yield files_1.getStats(path);
    if (!stats.isDirectory() || stats.isBlockDevice() || stats.isCharacterDevice() || stats.isSymbolicLink() || stats.isSocket())
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Path is not a directory');
    return files_1.getFormattedDetails(path);
}));
router.post('/directories', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dto = req.body;
    if (!dto.path)
        dto.path = '/';
    if (!dto.name)
        dto.name = 'New Folder';
    const path = new files_1.Path(dto.path);
    path.appendPath(dto.name);
    const result = yield files_1.createDirectoryWithRetry(path);
    console.log(result);
    res.status(http_status_codes_1.StatusCodes.CREATED);
    res.json({
        name: result.name,
        isDirectory: true,
        isFile: false,
    });
}));
router.get('/files/info', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let p = req.query.path;
    if (!p || typeof p !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File not found');
    const path = new files_1.Path(p);
    res.json(Object.assign(Object.assign({}, (yield files_1.getFormattedDetails(path))), { key: `${config_1.config.userid}.${common_1.uuidv4()}`, readToken: jwtService_1.createJwtToken({
            file: p,
            permissions: [tokenStore_1.Permission.FileBrowserRead],
        }, 5 * 60), writeToken: jwtService_1.createJwtToken({
            file: p,
            permissions: [tokenStore_1.Permission.FileBrowserWrite],
        }, 24 * 60 * 60) }));
    res.status(http_status_codes_1.StatusCodes.OK);
}));
router.post('/files', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files.newFiles;
    const dto = req.body;
    if (!dto.path)
        dto.path = '/';
    if (Array.isArray(files)) {
        const results = [];
        yield Promise.all(files.map((f) => __awaiter(void 0, void 0, void 0, function* () {
            const path = new files_1.Path(dto.path);
            path.appendPath(f.name);
            const result = yield files_1.saveFileWithRetry(path, f);
            results.push(result);
        })));
        res.json(results);
        res.status(http_status_codes_1.StatusCodes.CREATED);
        return;
    }
    const path = new files_1.Path(dto.path);
    path.appendPath(files.name);
    const result = yield files_1.saveFileWithRetry(path, files);
    res.json(result);
    res.status(http_status_codes_1.StatusCodes.CREATED);
}));
router.delete('/files', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pathClass = new files_1.Path(req.body.filepath);
    const result = yield files_1.removeFile(pathClass);
    res.json(result);
    res.status(http_status_codes_1.StatusCodes.CREATED);
}));
router.get('/files', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let p = req.query.path;
    if (!p || typeof p !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File not found');
    const path = new files_1.Path(p);
    if (yield files_1.isPathDirectory(path)) {
        const zip = new AdmZip();
        let uploadDir = fs.readdirSync(path.securedPath);
        for (let i = 0; i < uploadDir.length; i++) {
            zip.addLocalFile(path.securedPath + '/' + uploadDir[i]);
        }
        const data = zip.toBuffer();
        // code to download zip file
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment`);
        res.set('Content-Length', data.length);
        res.send(data);
    }
    else {
        res.download(path.securedPath);
        res.status(http_status_codes_1.StatusCodes.CREATED);
    }
}));
router.get('/internal/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let p = req.query.path;
    let token = req.query.token;
    if (!token || typeof token !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'No valid token provided');
    if (!p || typeof p !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File not found');
    if (tokenStore_1.isBlocked(token))
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Provided token is blocked');
    const [payload, err] = jwtService_1.verifyJwtToken(token);
    if (err)
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, err.message);
    if (!payload || !payload.data || payload.data.permissions.indexOf(tokenStore_1.Permission.FileBrowserRead) === -1 || payload.data.file !== p)
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'No permission for reading file');
    const path = new files_1.Path(p);
    res.download(path.securedPath);
    res.status(http_status_codes_1.StatusCodes.OK);
}));
router.post('/internal/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const token = req.query.token;
    if (!token || typeof token !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'No valid token provided');
    if (body.status !== 2 && body.status !== 6) {
        res.json({ error: 0 });
        return;
    }
    if (tokenStore_1.isBlocked(token))
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Provided token is blocked');
    const [payload, err] = jwtService_1.verifyJwtToken(token);
    if (err)
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, err.message);
    if (!payload || !payload.data || payload.data.permissions.indexOf(tokenStore_1.Permission.FileBrowserWrite) === -1)
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'No permission for reading file');
    if (!payload.data.file || !body.url)
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File not found');
    const url = new URL(body.url);
    url.hostname = 'onlyoffice-documentserver';
    url.protocol = 'http:';
    const fileResponse = sync_request_1.default('GET', url);
    const fileBuffer = fileResponse.body;
    yield files_1.saveFile(new files_1.Path(payload.data.file), fileBuffer);
    res.json({ error: 0 });
    res.status(http_status_codes_1.StatusCodes.OK);
}));
router.post('/files/copy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body.paths;
    const result = yield Promise.all(data.map(function (item) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(item);
            const pathObj = new files_1.Path(item.path);
            const pathToPaste = new files_1.Path(req.body.pathToPaste + '/' + item.fullName);
            if (!(yield files_1.isPathDirectory(pathObj))) {
                const file = yield files_1.getFile(pathObj);
                yield files_1.copyFileWithRetry(pathToPaste, file);
            }
            else {
                yield files_1.copyDirectoryWithRetry(pathObj, pathToPaste);
            }
        });
    }));
    res.json(result);
    res.status(http_status_codes_1.StatusCodes.CREATED);
}));
router.put('/files/rename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const oldPath = new files_1.Path(req.body.oldPath);
    const newPath = new files_1.Path(req.body.newPath);
    const result = yield files_1.renameFile(oldPath, newPath);
    res.json(result);
    res.status(http_status_codes_1.StatusCodes.CREATED);
}));
router.get('/files/search', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let term = req.query.searchTerm;
    let dir = req.query.currentDir;
    if (!dir || typeof dir !== 'string')
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'File not found');
    const path = new files_1.Path(dir);
    let fileList = yield files_1.getFilesRecursive(path);
    let filteredList = yield files_1.filterOnString(term.toString(), fileList);
    const results = filteredList.length > 0 ? filteredList : "None";
    res.json(results);
    res.status(http_status_codes_1.StatusCodes.CREATED);
}));
exports.default = router;
