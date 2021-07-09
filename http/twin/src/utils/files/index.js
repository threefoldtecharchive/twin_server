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
exports.getFileDetails = exports.getMimeType = exports.renameFile = exports.removeFile = exports.filterOnString = exports.getFilesRecursive = exports.getFileData = exports.getFileStream = exports.moveFile = exports.copyDir = exports.copyFile = exports.saveFile = exports.moveUploadedFile = exports.saveUploadedFile = exports.copyDirectoryWithRetry = exports.copyFileWithRetry = exports.saveFileWithRetry = exports.isPathDirectory = exports.doesPathExist = exports.readDir = exports.createDir = exports.createDirectoryWithRetry = exports.getFormattedDetails = exports.getFile = exports.getDetails = exports.getStats = exports.Path = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const fileSystemError_1 = require("../../types/errors/fileSystemError");
const stream_buffers_1 = require("stream-buffers");
const config_1 = require("../../config/config");
const mime_1 = __importDefault(require("mime"));
const fse = __importStar(require("fs-extra"));
class Path {
    constructor(path) {
        this._path = path;
        this.setSecuredPath();
    }
    setSecuredPath() {
        const baseDir = path_1.default.join(config_1.config.baseDir, config_1.config.storage);
        const realPath = path_1.default.join(baseDir, this._path);
        if (realPath.indexOf(baseDir) !== 0)
            throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.ForbidTraversal, 'Traversal not allowed!');
        this._securedPath = realPath;
    }
    setPath(path) {
        this._path = path;
        this.setSecuredPath();
    }
    appendPath(path) {
        this._path = path_1.default.join(this._path, path);
        this.setSecuredPath();
    }
    get path() {
        return this._path;
    }
    get securedPath() {
        return this._securedPath;
    }
}
exports.Path = Path;
/**
 * Get the stats of the selected path
 * @param path
 */
const getStats = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.doesPathExist(path);
    if (!exists) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.FileNotFound, 'fileDoesNotExist');
    }
    return fs_1.promises.stat(path.securedPath);
});
exports.getStats = getStats;
/**
 * Get the details of the selected path
 * @param path
 */
const getDetails = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.doesPathExist(path);
    if (!exists) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.PathDoesNotExist, 'fileDoesNotExist');
    }
    return path_1.default.parse(path.securedPath);
});
exports.getDetails = getDetails;
/**
 * Get the file content if exist
 * @param path
 */
const getFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.doesPathExist(path);
    if (!exists) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.FileNotFound, 'fileDoesNotExist');
    }
    return yield readFile(path);
});
exports.getFile = getFile;
/**
 * Get the formatted details of the path
 * @param path
 */
const getFormattedDetails = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield exports.getStats(path);
    const details = path_1.default.parse(path.securedPath);
    const extension = details.ext.replace('.', '');
    return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        path: path.path,
        fullName: details.base,
        name: details.name,
        extension: extension,
        size: stats.size,
        createdOn: stats.ctime,
        lastModified: stats.mtime,
        lastAccessed: stats.atime,
    };
});
exports.getFormattedDetails = getFormattedDetails;
/**
 * Create new directory, if it exist it will retry with a number suffix
 * @param path
 * @param count
 */
const createDirectoryWithRetry = (path, count = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exports.createDir(count === 0 ? path : new Path(`${path.path} (${count})`));
    if (!result) {
        return exports.createDirectoryWithRetry(path, count + 1);
    }
    return result;
});
exports.createDirectoryWithRetry = createDirectoryWithRetry;
/**
 * Create new directory if it doesn't exist
 * @param path
 */
const createDir = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.doesPathExist(path);
    if (exists) {
        return;
    }
    yield createDirectory(path);
    return yield exports.getFormattedDetails(path);
});
exports.createDir = createDir;
/**
 * Read the requested dir
 * @param path
 * @param options
 */
const readDir = (path, options) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield exports.doesPathExist(path);
    if (!exists)
        return [];
    const content = yield readDirectory(path, options);
    return (yield Promise.all(content.map(c => {
        if (c.isBlockDevice() || c.isCharacterDevice() || c.isSymbolicLink() || c.isSocket())
            return;
        const itemPath = new Path(path.path);
        itemPath.appendPath(c.name);
        return exports.getFormattedDetails(itemPath);
    }))).filter(c => c);
});
exports.readDir = readDir;
/**
 * Checks if the path does exist
 * @param path
 */
const doesPathExist = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.stat(path.securedPath);
        return true;
    }
    catch (e) {
        return false;
    }
});
exports.doesPathExist = doesPathExist;
const isPathDirectory = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield fs_1.lstatSync(path.securedPath).isDirectory();
    }
    catch (e) {
        return false;
    }
});
exports.isPathDirectory = isPathDirectory;
const saveFileWithRetry = (path, file, count = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exports.saveUploadedFile(count === 0 ? path : new Path(path.path.insert(path.path.lastIndexOf('.'), ` (${count})`)), file);
    if (!result) {
        return yield exports.saveFileWithRetry(path, file, count + 1);
    }
    return result;
});
exports.saveFileWithRetry = saveFileWithRetry;
const copyFileWithRetry = (path, file, count = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exports.copyFile(count === 0 ? path : new Path(path.path.insert(path.path.lastIndexOf('.'), ` (${count})`)), file);
    console.log(result);
    if (!result) {
        return yield exports.copyFileWithRetry(path, file, count + 1);
    }
    return result;
});
exports.copyFileWithRetry = copyFileWithRetry;
const copyDirectoryWithRetry = (path, destPath, count = 0) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield exports.copyDir(count === 0 ? destPath : new Path(destPath.path.insert(destPath.path.length, ` (${count})`)), path);
    if (!result) {
        return yield exports.copyDirectoryWithRetry(path, destPath, count + 1);
    }
    return result;
});
exports.copyDirectoryWithRetry = copyDirectoryWithRetry;
/**
 * Saved file
 * @param path
 * @param file
 */
const saveUploadedFile = (path, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield exports.doesPathExist(path))
        return;
    if (file.tempFilePath)
        return yield exports.moveUploadedFile(file, path);
    return exports.saveFile(path, file.data);
});
exports.saveUploadedFile = saveUploadedFile;
const moveUploadedFile = (file, path) => __awaiter(void 0, void 0, void 0, function* () {
    const directory = new Path(path.path.removeAfterLastOccurrence('/'));
    if (!(yield exports.doesPathExist(directory))) {
        yield exports.createDir(directory);
    }
    yield file.mv(path.securedPath);
    return yield exports.getFormattedDetails(path);
});
exports.moveUploadedFile = moveUploadedFile;
const saveFile = (path, file) => __awaiter(void 0, void 0, void 0, function* () {
    const directory = new Path(path.path.removeAfterLastOccurrence('/'));
    if (!(yield exports.doesPathExist(directory))) {
        yield exports.createDir(directory);
    }
    yield writeFile(path, file);
    return yield exports.getFormattedDetails(path);
});
exports.saveFile = saveFile;
/**
 * Copy the file to a new location on filesystem
 * @param path
 * @param file
 */
const copyFile = (path, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Buffer.isBuffer(file)) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.WrongFormat);
    }
    if (yield exports.doesPathExist(path))
        return;
    const directory = new Path(path.path.removeAfterLastOccurrence('/'));
    if (!(yield exports.doesPathExist(directory))) {
        yield exports.createDir(directory);
    }
    yield writeFile(path, file);
    return yield exports.getFormattedDetails(path);
});
exports.copyFile = copyFile;
const copyDir = (destPath, path) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield exports.doesPathExist(destPath)) || path === destPath) {
        yield copyDirectory(path, destPath);
        return yield exports.getFormattedDetails(destPath);
    }
    return undefined;
});
exports.copyDir = copyDir;
/**
 * Copy the file to a new location on filesystem
 * @param oldPath
 * @param newPath
 * @param fileInfo
 */
const moveFile = (oldPath, newPath, fileInfo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Buffer.isBuffer(fileInfo.data)) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.WrongFormat);
    }
    if (!(yield exports.doesPathExist(newPath))) {
        yield exports.createDir(newPath);
    }
    oldPath.setPath(path_1.default.join(oldPath.path, fileInfo.name));
    newPath.setPath(path_1.default.join(newPath.path, fileInfo.name));
    yield exports.removeFile(oldPath);
    yield writeFile(newPath, fileInfo.data);
    return yield exports.getFormattedDetails(newPath);
});
exports.moveFile = moveFile;
/**
 * Get the stream buffer of the decrypted file
 * @param path
 */
const getFileStream = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield readFile(path);
    const buffer = new stream_buffers_1.ReadableStreamBuffer({
        frequency: 10,
        chunkSize: 2048,
    });
    buffer.put(file);
    buffer.stop();
    return buffer;
});
exports.getFileStream = getFileStream;
const getFileData = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const fileDetails = yield exports.getDetails(path);
    if (!fileDetails) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.FileNotFound);
    }
    const contentType = yield exports.getMimeType(path);
    const fileStream = yield exports.getFileStream(path);
    return {
        fileDetails,
        fileStream,
        contentType,
    };
});
exports.getFileData = getFileData;
const getFilesRecursive = (dir, fileList = []) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield exports.readDir(dir, { withFileTypes: true });
    for (const file of files) {
        if (fs_1.statSync(path_1.default.join(dir.securedPath, file.fullName)).isDirectory()) {
            fileList.push(file);
            fileList = yield exports.getFilesRecursive(new Path(path_1.default.join(dir.path, file.fullName)), fileList);
        }
        else {
            fileList.push(file);
        }
    }
    return fileList;
});
exports.getFilesRecursive = getFilesRecursive;
const filterOnString = (term, fileList = []) => __awaiter(void 0, void 0, void 0, function* () {
    let filteredList = [];
    for (const file of fileList) {
        if (file.fullName.toLowerCase().includes(term.toLowerCase())) {
            filteredList.push(file);
        }
    }
    return filteredList;
});
exports.filterOnString = filterOnString;
const readFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_1.promises.readFile(path.securedPath);
});
const createDirectory = (path) => {
    return fs_1.promises.mkdir(path.securedPath, { recursive: true });
};
const fileExists = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.access(path.securedPath);
        return true;
    }
    catch (e) {
        return false;
    }
});
const readDirectory = (path, options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_1.promises.readdir(path.securedPath, options);
});
const writeFile = (path, file) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fs_1.promises.writeFile(path.securedPath, file);
});
const copyDirectory = (srcDir, destDir) => __awaiter(void 0, void 0, void 0, function* () {
    return yield fse.copySync(srcDir.securedPath, destDir.securedPath);
});
const removeFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield exports.isPathDirectory(path)) {
        return fs_1.rmdirSync(path.securedPath, { recursive: true });
    }
    if (!(yield exports.doesPathExist(path))) {
        throw new fileSystemError_1.FileSystemError(fileSystemError_1.FileSystemErrorType.FileNotFound);
    }
    return yield fs_1.promises.rm(path.securedPath);
});
exports.removeFile = removeFile;
const renameFile = (oldPath, newPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield exports.doesPathExist(oldPath)) || (yield exports.doesPathExist(newPath))) {
        return;
    }
    return yield fs_1.promises.rename(oldPath.securedPath, newPath.securedPath);
});
exports.renameFile = renameFile;
/**
 *
 * @param path
 */
const getMimeType = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return mime_1.default.getType(path.securedPath);
});
exports.getMimeType = getMimeType;
const getFileDetails = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return path_1.default.parse(path.securedPath);
});
exports.getFileDetails = getFileDetails;
