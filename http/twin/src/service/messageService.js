"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRead = exports.editMessage = exports.editReply = exports.parseMessage = exports.parseMessages = void 0;
const types_1 = require("../types");
const message_1 = __importDefault(require("../models/message"));
const dataService_1 = require("./dataService");
const socketService_1 = require("./socketService");
const messages_1 = require("../routes/messages");
const parseMessages = (messages) => messages.map(exports.parseMessage);
exports.parseMessages = parseMessages;
const parseMessage = (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const type = msg.type;
    // console.log('MESSAGE: ', msg);
    switch (type) {
        case types_1.MessageTypes.STRING:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, type, msg.replies
                ? [...(_a = msg.replies) === null || _a === void 0 ? void 0 : _a.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.GIF:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, type, msg.replies
                ? [...(_b = msg.replies) === null || _b === void 0 ? void 0 : _b.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.CONTACT_REQUEST:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, type, msg.replies
                ? [...(_c = msg.replies) === null || _c === void 0 ? void 0 : _c.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.GROUP_UPDATE:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, type, msg.replies
                ? [...(_d = msg.replies) === null || _d === void 0 ? void 0 : _d.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.FILE_UPLOAD:
            console.log("File re-upload");
            const url = dataService_1.saveFile(msg.to, msg.id, {
                name: msg.body.name,
                data: msg.body.parsedFile
            });
            return new message_1.default(msg.from, msg.to, { filename: msg.body.name }, new Date(msg.timeStamp), msg.id, types_1.MessageTypes.FILE, msg.replies
                ? [...(_e = msg.replies) === null || _e === void 0 ? void 0 : _e.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.FILE:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, type, msg.replies
                ? [...(_f = msg.replies) === null || _f === void 0 ? void 0 : _f.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.EDIT:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, types_1.MessageTypes.EDIT, msg.replies
                ? [...(_g = msg.replies) === null || _g === void 0 ? void 0 : _g.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.DELETE:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, types_1.MessageTypes.DELETE, msg.replies
                ? [...(_h = msg.replies) === null || _h === void 0 ? void 0 : _h.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.QUOTE:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, types_1.MessageTypes.QUOTE, msg.replies
                ? [...(_j = msg.replies) === null || _j === void 0 ? void 0 : _j.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        case types_1.MessageTypes.READ:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, types_1.MessageTypes.READ, msg.replies
                ? [...(_k = msg.replies) === null || _k === void 0 ? void 0 : _k.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
        default:
            return new message_1.default(msg.from, msg.to, msg.body, new Date(msg.timeStamp), msg.id, msg.type, msg.replies
                ? [...(_l = msg.replies) === null || _l === void 0 ? void 0 : _l.map((r) => exports.parseMessage(r))]
                : [], msg === null || msg === void 0 ? void 0 : msg.subject, msg === null || msg === void 0 ? void 0 : msg.signatures, msg === null || msg === void 0 ? void 0 : msg.updated);
    }
};
exports.parseMessage = parseMessage;
const editReply = (chatId, newMessage) => {
    var _a, _b;
    const chat = dataService_1.getChat(chatId);
    const messageIndex = chat.messages.findIndex(mes => mes.id === newMessage.subject);
    if (messageIndex === -1) {
        return;
    }
    const replyIndex = (_b = (_a = chat.messages[messageIndex]) === null || _a === void 0 ? void 0 : _a.replies) === null || _b === void 0 ? void 0 : _b.findIndex(r => r.id === newMessage.id);
    if (replyIndex === -1) {
        return;
    }
    chat.messages[messageIndex].replies[replyIndex].body = newMessage.body;
    chat.messages[messageIndex].replies[replyIndex].updated = new Date();
    dataService_1.persistChat(chat);
};
exports.editReply = editReply;
const editMessage = (chatId, newMessage) => {
    if (newMessage.subject) {
        exports.editReply(chatId, newMessage);
        return;
    }
    const chat = dataService_1.getChat(chatId);
    switch (newMessage.type) {
        case types_1.MessageTypes.DELETE: {
            const index = chat.messages.findIndex(mes => mes.id === newMessage.id);
            chat.messages[index].body = newMessage.body;
            chat.messages[index].type = types_1.MessageTypes.DELETE;
            break;
        }
        case types_1.MessageTypes.EDIT: {
            const editedMessage = exports.parseMessage(newMessage.body);
            //@todo: error handling when not parsed
            const index = chat.messages.findIndex(mes => mes.id === editedMessage.id);
            chat.messages[index] = editedMessage;
            break;
        }
    }
    dataService_1.persistChat(chat);
};
exports.editMessage = editMessage;
const handleRead = (message) => {
    // console.log('reading');
    let chatId = messages_1.determineChatId(message);
    const chat = dataService_1.getChat(chatId);
    const newRead = chat.messages.find(m => m.id === message.body);
    const oldRead = chat.messages.find(m => m.id === chat.read[message.from]);
    if (oldRead &&
        newRead &&
        newRead.timeStamp.getTime() < oldRead.timeStamp.getTime()) {
        return;
    }
    chat.read[message.from] = message.body;
    dataService_1.persistChat(chat);
    socketService_1.sendEventToConnectedSockets('message', message);
};
exports.handleRead = handleRead;
