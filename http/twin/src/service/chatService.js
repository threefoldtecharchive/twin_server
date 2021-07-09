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
exports.parseChat = exports.parsePartialChat = exports.parseFullChat = exports.getChatById = exports.getChatRequests = exports.getAcceptedChatsWithPartialMessages = exports.setChatToAccepted = exports.getMessagesFromId = exports.syncNewChatWithAdmin = exports.addChat = exports.persistMessage = void 0;
const chat_1 = __importDefault(require("../models/chat"));
const dataService_1 = require("./dataService");
const messageService_1 = require("./messageService");
const socketService_1 = require("./socketService");
const apiService_1 = require("./apiService");
const config_1 = require("../config/config");
const persistMessage = (chatId, message) => {
    const chat = dataService_1.getChat(chatId);
    if (!message.subject) {
        chat.messages.push(message);
        dataService_1.persistChat(chat);
        socketService_1.sendEventToConnectedSockets('message', message);
        return;
    }
    const subjectMessageIndex = chat.messages.findIndex(m => m.id === message.subject);
    const subjectMessage = chat.messages[subjectMessageIndex];
    subjectMessage.replies = [...subjectMessage.replies, message];
    chat.messages[subjectMessageIndex] = subjectMessage;
    // logger.info(subjectMessage)
    dataService_1.persistChat(chat);
    socketService_1.sendEventToConnectedSockets('message', chat.messages[subjectMessageIndex]);
};
exports.persistMessage = persistMessage;
const addChat = (chatId, contacts, isGroupchat, message, name, acceptedChat, adminId) => {
    const chat = new chat_1.default(chatId, contacts, isGroupchat, message, name, acceptedChat, adminId, {});
    // @TODO clean this up
    if (chat.chatId == config_1.config.userid) {
        return null;
    }
    dataService_1.persistChat(chat);
    socketService_1.sendEventToConnectedSockets('new_chat', chat);
    return chat;
};
exports.addChat = addChat;
const syncNewChatWithAdmin = (adminLocation, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield apiService_1.getChatfromAdmin(adminLocation, chatId);
    console.log('retreived chat', chat);
    socketService_1.sendEventToConnectedSockets('new_chat', chat);
    dataService_1.persistChat(chat);
});
exports.syncNewChatWithAdmin = syncNewChatWithAdmin;
const getMessagesFromId = (chatId) => true;
exports.getMessagesFromId = getMessagesFromId;
const setChatToAccepted = (chatId) => true;
exports.setChatToAccepted = setChatToAccepted;
//@TODO filter for acceptedchatss
const getAcceptedChatsWithPartialMessages = (messageAmount = 0) => {
    return dataService_1.getChatIds().map(chatid => dataService_1.getChat(chatid, messageAmount));
    // .filter((chat) => chat.acceptedChat);
};
exports.getAcceptedChatsWithPartialMessages = getAcceptedChatsWithPartialMessages;
// @TODO will need to use this later
const getChatRequests = () => {
    return dataService_1.getChatIds()
        .map(chatid => dataService_1.getChat(chatid))
        .filter(chat => !chat.acceptedChat);
};
exports.getChatRequests = getChatRequests;
const getChatById = (id) => {
    return dataService_1.getChat(id);
};
exports.getChatById = getChatById;
const parseFullChat = (chat) => exports.parseChat(chat, messageService_1.parseMessages(chat.messages));
exports.parseFullChat = parseFullChat;
const parsePartialChat = (chat, amount) => {
    const start = chat.messages.length - amount;
    const messages = chat.messages.slice(start < 0 ? 0 : start, chat.messages.length);
    return exports.parseChat(chat, messageService_1.parseMessages(messages));
};
exports.parsePartialChat = parsePartialChat;
const parseChat = (chat, messages) => {
    return new chat_1.default(chat.chatId, chat.contacts, chat.isGroup, messages, chat.name, chat.acceptedChat, chat.adminId, chat.read);
};
exports.parseChat = parseChat;
