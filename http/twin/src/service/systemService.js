"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSystemMessage = void 0;
const types_1 = require("../types");
const chatService_1 = require("./chatService");
const dataService_1 = require("./dataService");
const config_1 = require("../config/config");
const socketService_1 = require("./socketService");
const apiService_1 = require("./apiService");
const handleSystemMessage = (message, chat) => {
    if (chat.adminId !== message.from) {
        throw Error('not allowed');
    }
    switch (message.body.type) {
        case types_1.SystemMessageType.ADDUSER:
            chat.contacts.push(message.body.contact);
            socketService_1.sendEventToConnectedSockets('chat_updated', chat);
            apiService_1.sendMessageToApi(message.body.contact.location, message);
            break;
        case types_1.SystemMessageType.REMOVEUSER:
            if (message.body.contact.id === config_1.config.userid) {
                dataService_1.deleteChat(chat.chatId);
                socketService_1.sendEventToConnectedSockets('chat_removed', chat.chatId);
                return;
            }
            chat.contacts = chat.contacts.filter(c => c.id !== message.body.contact.id);
            apiService_1.sendMessageToApi(message.body.contact.location, message);
            break;
        case types_1.SystemMessageType.JOINED_VIDEOROOM: {
            chatService_1.persistMessage(chat.chatId, message);
            return;
        }
        case types_1.SystemMessageType.CONTACT_REQUEST_SEND: {
            chatService_1.persistMessage(chat.chatId, message);
            return;
        }
        default:
            throw Error('not implemented');
    }
    dataService_1.persistChat(chat);
};
exports.handleSystemMessage = handleSystemMessage;
