"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlocked = exports.initTokens = exports.Permission = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config/config");
const dataService_1 = require("../service/dataService");
const jwtService_1 = require("../service/jwtService");
var Permission;
(function (Permission) {
    Permission["FileBrowserRead"] = "FileBrowserRead";
    Permission["FileBrowserWrite"] = "FileBrowserWrite";
})(Permission = exports.Permission || (exports.Permission = {}));
const initTokens = () => {
    try {
        if (fs_1.default.existsSync(path_1.default.join(config_1.config.baseDir, '/user', '/tokens.json'))) {
            removeExpiredTokens();
            return;
        }
        throw new Error();
    }
    catch (ex) {
        dataService_1.saveTokenFile({
            blockedTokens: [],
        });
    }
};
exports.initTokens = initTokens;
const isValid = (token) => {
    const [data, err] = jwtService_1.verifyJwtToken(token);
    return data && !err;
};
const isBlocked = (token) => {
    return dataService_1.getTokenFile().blockedTokens.some(x => x === token);
};
exports.isBlocked = isBlocked;
const removeExpiredTokens = () => {
    const tokens = dataService_1.getTokenFile();
    const newTokens = {
        blockedTokens: tokens.blockedTokens.filter(isValid),
    };
    dataService_1.saveTokenFile(newTokens);
};
