"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contacts = void 0;
const dataService_1 = require("../service/dataService");
const config_1 = require("../config/config");
//todo create propper contactArray
const chatIds = dataService_1.getChatIds();
const chats = dataService_1.getChatIds().map((chatId) => dataService_1.getChat(chatId));
const contactList = chats
    .filter(chat => !chat.isGroup)
    .map(chat => {
    return chat.contacts.find(cont => cont.id !== config_1.config.userid);
});
exports.contacts = contactList;
