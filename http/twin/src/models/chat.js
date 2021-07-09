"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Chat {
    constructor(chatId, contacts, isGroup, messages, name, acceptedChat, adminId, read = {}) {
        this.read = {};
        this.chatId = chatId;
        this.contacts = contacts;
        this.isGroup = isGroup;
        this.messages = messages;
        this.name = name;
        this.acceptedChat = acceptedChat;
        this.adminId = adminId;
        this.read = read;
    }
    addMessage(message) {
        this.messages.push(message);
    }
}
exports.default = Chat;
