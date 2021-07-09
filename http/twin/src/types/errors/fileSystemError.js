"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemError = exports.FileSystemErrorType = void 0;
const errorWrapper_1 = require("./errorWrapper");
const http_status_codes_1 = require("http-status-codes");
var FileSystemErrorType;
(function (FileSystemErrorType) {
    FileSystemErrorType[FileSystemErrorType["FileNotFound"] = 0] = "FileNotFound";
    FileSystemErrorType[FileSystemErrorType["PathDoesNotExist"] = 1] = "PathDoesNotExist";
    FileSystemErrorType[FileSystemErrorType["WrongFormat"] = 2] = "WrongFormat";
    FileSystemErrorType[FileSystemErrorType["ForbidTraversal"] = 3] = "ForbidTraversal";
})(FileSystemErrorType = exports.FileSystemErrorType || (exports.FileSystemErrorType = {}));
const mapFileSystemErrorToHttpError = (error) => {
    switch (error) {
        case FileSystemErrorType.WrongFormat:
        case FileSystemErrorType.ForbidTraversal: return http_status_codes_1.StatusCodes.BAD_REQUEST;
        case FileSystemErrorType.PathDoesNotExist:
        case FileSystemErrorType.FileNotFound: return http_status_codes_1.StatusCodes.NOT_FOUND;
        default: return http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    }
};
class FileSystemError extends errorWrapper_1.ErrorWrapper {
    constructor() {
        super(...arguments);
        this.getHttpStatus = () => mapFileSystemErrorToHttpError(this.status);
    }
}
exports.FileSystemError = FileSystemError;
