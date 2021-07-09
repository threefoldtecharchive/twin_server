"use strict";
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
exports.getBlocklist = exports.persistBlocklist = exports.resizeAvatar = exports.deleteAvatar = exports.saveAvatar = exports.saveFile = exports.persistUserdata = exports.deleteChat = exports.persistChat = exports.getKey = exports.saveKey = exports.Key = exports.getUserdata = exports.saveTokenFile = exports.getTokenFile = exports.getChat = exports.getChatIds = void 0;
const config_1 = require("../config/config");
const fs_1 = __importDefault(require("fs"));
const chatService_1 = require("./chatService");
const lodash_1 = require("lodash");
const imagemagick_1 = __importDefault(require("imagemagick"));
const path_1 = __importDefault(require("path"));
const getChatIds = () => {
    const location = config_1.config.baseDir + 'chats';
    const locations = fs_1.default.readdirSync(location);
    console.log(locations);
    return locations;
};
exports.getChatIds = getChatIds;
const getChat = (id, messagesAmount = undefined) => {
    const path = config_1.config.baseDir + `chats/${id}/chat.json`;
    const chat = JSON.parse(fs_1.default.readFileSync(path).toString());
    return messagesAmount === undefined
        ? chatService_1.parseFullChat(chat)
        : chatService_1.parsePartialChat(chat, messagesAmount);
};
exports.getChat = getChat;
const getTokenFile = () => {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.join(config_1.config.baseDir, '/user', '/tokens.json')).toString());
};
exports.getTokenFile = getTokenFile;
const saveTokenFile = (tokens) => {
    fs_1.default.writeFileSync(path_1.default.join(config_1.config.baseDir, '/user', '/tokens.json'), JSON.stringify(tokens, null, 4), {
        flag: 'w',
    });
};
exports.saveTokenFile = saveTokenFile;
const getUserdata = () => {
    const location = config_1.config.baseDir + 'user/userinfo.json';
    try {
        const data = JSON.parse(fs_1.default.readFileSync(location).toString());
        return data;
    }
    catch (_a) {
        throw new Error('Userinfo file doesn\'t exitst');
    }
};
exports.getUserdata = getUserdata;
var Key;
(function (Key) {
    Key["Public"] = "publicKey";
    Key["Private"] = "privateKey";
})(Key = exports.Key || (exports.Key = {}));
const saveKey = (key, keyName, force = false) => {
    if (force || !fs_1.default.existsSync(config_1.config.baseDir + 'user/' + keyName)) {
        fs_1.default.writeFileSync(config_1.config.baseDir + 'user/' + keyName, key);
    }
};
exports.saveKey = saveKey;
const getKey = (keyName) => {
    try {
        return fs_1.default.readFileSync(config_1.config.baseDir + 'user/' + keyName, 'utf8');
    }
    catch (ex) {
        if (ex.code === 'ENOENT') {
            console.log(keyName + ' not found!');
        }
        throw ex;
    }
};
exports.getKey = getKey;
const sortChat = (chat) => {
    const messages = lodash_1.uniqBy(chat.messages, m => m.id);
    messages.map(m => {
        const replies = lodash_1.uniqBy(m.replies, r => r.id);
        replies.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
        m.replies = replies;
    });
    messages.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
    chat.messages = messages;
    return chat;
};
const persistChat = (chat) => {
    const sortedChat = sortChat(chat);
    const path = config_1.config.baseDir + `chats/${sortedChat.chatId}`;
    try {
        fs_1.default.statSync(path);
    }
    catch (_a) {
        fs_1.default.mkdirSync(path);
        fs_1.default.mkdirSync(path + '/files');
    }
    fs_1.default.writeFileSync(path + '/chat.json', JSON.stringify(sortedChat, null, 4), {
        flag: 'w',
    });
};
exports.persistChat = persistChat;
const deleteChat = (chatId) => {
    const path = config_1.config.baseDir + `chats/${chatId}`;
    try {
        fs_1.default.rmdirSync(path, { recursive: true });
    }
    catch (e) {
        console.log(e);
        return false;
    }
    return true;
};
exports.deleteChat = deleteChat;
const persistUserdata = (userData) => {
    const userdata = JSON.stringify(userData, null, 4);
    const location = config_1.config.baseDir + 'user/userinfo.json';
    fs_1.default.writeFileSync(location, userdata, { flag: 'w' });
    return;
};
exports.persistUserdata = persistUserdata;
const saveFile = (chatId, messageId, file) => {
    let path = `${config_1.config.baseDir}chats/${chatId}/files/${messageId}`;
    fs_1.default.mkdirSync(path);
    path = `${path}/${file.name}`;
    if (file.tempFilePath && file.mv) {
        file.mv(path);
    }
    else if (file.data) {
        fs_1.default.writeFileSync(path, file.data);
    }
    return path;
};
exports.saveFile = saveFile;
const saveAvatar = (file, id) => __awaiter(void 0, void 0, void 0, function* () {
    const path = `${config_1.config.baseDir}user/avatar-${id}`;
    const tempPath = `${config_1.config.baseDir}user/temp-avatar-${id}`;
    yield file.mv(tempPath);
    yield exports.resizeAvatar(tempPath, path);
    fs_1.default.unlinkSync(tempPath);
});
exports.saveAvatar = saveAvatar;
const deleteAvatar = (id) => {
    fs_1.default.unlinkSync(`${config_1.config.baseDir}user/avatar-${id}`);
};
exports.deleteAvatar = deleteAvatar;
const resizeAvatar = (from, to) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        imagemagick_1.default.resize({
            srcPath: from,
            dstPath: to,
            width: 64,
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
});
exports.resizeAvatar = resizeAvatar;
const persistBlocklist = (blockList) => {
    const location = config_1.config.baseDir + 'user/blockList.json';
    fs_1.default.writeFileSync(location, JSON.stringify(blockList, null, 4), {
        flag: 'w',
    });
    return;
};
exports.persistBlocklist = persistBlocklist;
const getBlocklist = () => {
    const location = config_1.config.baseDir + 'user/blockList.json';
    try {
        return JSON.parse(fs_1.default.readFileSync(location).toString());
    }
    catch (_a) {
        return [];
    }
};
exports.getBlocklist = getBlocklist;
