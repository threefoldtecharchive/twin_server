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
exports.verifySignedMessage = exports.verifySignedMessageByChat = exports.determineChatId = void 0;
const dataService_1 = require("./../service/dataService");
const express_1 = require("express");
const contactRequests_1 = require("../store/contactRequests");
const socketService_1 = require("../service/socketService");
const types_1 = require("../types");
const contact_1 = __importDefault(require("../models/contact"));
const messageService_1 = require("../service/messageService");
const chatService_1 = require("../service/chatService");
const dataService_2 = require("../service/dataService");
const config_1 = require("../config/config");
const apiService_1 = require("../service/apiService");
const chat_1 = __importDefault(require("../models/chat"));
const common_1 = require("../common");
const systemService_1 = require("../service/systemService");
const locationService_1 = require("../service/locationService");
const keyService_1 = require("../service/keyService");
const router = express_1.Router();
function handleContactRequest(message) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        contactRequests_1.contactRequests.push(message.body);
        const otherContact = new contact_1.default(message.from, message.body.location);
        const myLocation = yield locationService_1.getMyLocation();
        const myself = new contact_1.default(config_1.config.userid, myLocation);
        const requestMsg = {
            from: message.from,
            to: message.to,
            body: `You've received a new message request from ${message.from}`,
            id: common_1.uuidv4(),
            type: types_1.MessageTypes.SYSTEM,
            timeStamp: new Date(),
            replies: [],
            signatures: (_a = message.signatures) !== null && _a !== void 0 ? _a : [],
            subject: null,
        };
        const newchat = new chat_1.default(message.from, [myself, otherContact], false, [requestMsg], message.from, false, message.from);
        socketService_1.sendEventToConnectedSockets('connectionRequest', newchat);
        dataService_1.persistChat(newchat);
    });
}
const determineChatId = (message) => {
    if (message.to === config_1.config.userid) {
        return message.from;
    }
    return message.to;
};
exports.determineChatId = determineChatId;
const verifySignedMessageByChat = (chat, signedMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const adminContact = chat.contacts.find(x => x.id === chat.adminId);
    const fromContact = chat.contacts.find(x => x.id === signedMessage.from);
    return exports.verifySignedMessage(chat.isGroup, adminContact, fromContact, signedMessage);
});
exports.verifySignedMessageByChat = verifySignedMessageByChat;
const verifySignedMessage = (isGroup, adminContact, fromContact, signedMessage) => __awaiter(void 0, void 0, void 0, function* () {
    let signatureIndex = 0;
    if (isGroup && (adminContact === null || adminContact === void 0 ? void 0 : adminContact.id) !== config_1.config.userid) {
        const adminIsVerified = yield keyService_1.verifyMessageSignature(adminContact, signedMessage, signedMessage.signatures[signatureIndex]);
        if (!adminIsVerified) {
            console.log(`Admin signature is not correct`);
            return false;
        }
        signatureIndex++;
    }
    if (!fromContact) {
        console.log(`Sender ${signedMessage.from} is not found in the contact list`);
        return false;
    }
    return yield keyService_1.verifyMessageSignature(fromContact, signedMessage, signedMessage.signatures[signatureIndex]);
});
exports.verifySignedMessage = verifySignedMessage;
// Should be externally availble
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ TODO check if valid
    const msg = req.body;
    let message = msg;
    try {
        message = messageService_1.parseMessage(msg);
    }
    catch (e) {
        res.status(500).json({ status: 'failed', reason: 'validation failed' });
        return;
    }
    const blockList = dataService_1.getBlocklist();
    if (message.type === types_1.MessageTypes.CONTACT_REQUEST) {
        if (blockList.includes(message.from)) {
            //@todo what should i return whenblocked
            res.json({ status: 'blocked' });
            return;
        }
        const msg = message;
        yield exports.verifySignedMessage(false, undefined, msg.body, message);
        yield handleContactRequest(msg);
        res.json({ status: 'success' });
        return;
    }
    const chatId = exports.determineChatId(message);
    let chat;
    try {
        chat = dataService_2.getChat(chatId);
    }
    catch (e) {
        console.log(e);
        res.status(403).json('Sorry but I\'m not aware of this chat id');
        return;
    }
    const messageIsCorrectlySigned = yield exports.verifySignedMessageByChat(chat, message);
    if (!messageIsCorrectlySigned) {
        res.sendStatus(500);
        return;
    }
    if (blockList.includes(chatId)) {
        //@todo what should i return whenblocked
        res.json({ status: 'blocked' });
        return;
    }
    if (message.type === types_1.MessageTypes.SYSTEM) {
        console.log('received a groupUpdate');
        //@ts-ignore
        const groupUpdateMsg = message;
        if (groupUpdateMsg.body.type === 'ADDUSER' &&
            groupUpdateMsg.body.contact.id === config_1.config.userid) {
            console.log('I have been added to a group!');
            chatService_1.syncNewChatWithAdmin(groupUpdateMsg.body.adminLocation, groupUpdateMsg.to);
            res.json({ status: 'Successfully added chat' });
            return;
        }
    }
    if (chat.isGroup && chat.adminId == config_1.config.userid) {
        const messageIsVerified = yield exports.verifySignedMessage(false, undefined, chat.contacts.find(x => x.id === message.from), message);
        if (!messageIsVerified) {
            res.sendStatus(500);
            return;
        }
        keyService_1.appendSignatureToMessage(message);
        chat.contacts
            .filter(c => c.id !== config_1.config.userid)
            .forEach(c => {
            console.log(`group sendMessage to ${c.id}`);
            apiService_1.sendMessageToApi(c.location, message);
        });
        if (message.type === types_1.MessageTypes.SYSTEM) {
            systemService_1.handleSystemMessage(message, chat);
            res.json({ status: 'success' });
            return;
        }
        console.log(`received new group message from ${message.from}`);
        socketService_1.sendEventToConnectedSockets('message', message);
        if (message.type === types_1.MessageTypes.READ) {
            messageService_1.handleRead(message);
            res.json({ status: 'success' });
            return;
        }
        if (message.type === types_1.MessageTypes.EDIT ||
            message.type === types_1.MessageTypes.DELETE) {
            messageService_1.editMessage(chatId, message);
            socketService_1.sendEventToConnectedSockets('message', message);
            res.json({ status: 'success' });
            return;
        }
        console.log(`persistMessage:${chat.chatId}`);
        chatService_1.persistMessage(chat.chatId, message);
        res.json({ status: 'success' });
        return;
    }
    if (!chat && contactRequests_1.contactRequests.find(c => c.id == message.from)) {
        //@todo maybe 3 messages should be allowed or something
        res.status(403).json({
            status: 'Forbidden',
            reason: 'contact not yet approved',
        });
        return;
    }
    if (!chat) {
        res.status(403).json({ status: 'Forbidden', reason: 'not in contact' });
        return;
    }
    if (message.type === types_1.MessageTypes.EDIT ||
        message.type === types_1.MessageTypes.DELETE) {
        messageService_1.editMessage(chatId, message);
        socketService_1.sendEventToConnectedSockets('message', message);
        res.json({ status: 'success' });
        return;
    }
    if (message.type === types_1.MessageTypes.READ) {
        messageService_1.handleRead(message);
        res.json({ status: 'success' });
        return;
    }
    if (message.type === types_1.MessageTypes.SYSTEM) {
        systemService_1.handleSystemMessage(message, chat);
        res.json({ status: 'success' });
        return;
    }
    // const message = new Message(msg.from, msg.to, msg.body);
    console.log(`received new message from ${message.from}`);
    //
    chatService_1.persistMessage(chat.chatId, message);
    res.sendStatus(200);
}));
router.get('/:chatId', (req, res) => {
    const fromId = req.query.fromId;
    const page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    limit = limit > 100 ? 100 : limit;
    const chat = dataService_2.getChat(req.params.chatId);
    if (!chat) {
        res.sendStatus(404);
        return;
    }
    let end = chat.messages.length;
    if (page)
        end = chat.messages.length - (page * limit);
    else if (fromId)
        end = chat.messages.findIndex(m => m.id === fromId);
    const start = end - limit < 0 ? 0 : end - limit;
    res.json({
        hasMore: start !== 0,
        messages: chat.messages.slice(start, end),
    });
});
exports.default = router;
