"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatService_1 = require("../service/chatService");
const dataService_1 = require("../service/dataService");
const socketService_1 = require("../service/socketService");
const config_1 = require("../config/config");
const authenticationMiddleware_1 = require("../middlewares/authenticationMiddleware");
const httpError_1 = require("../types/errors/httpError");
const http_status_codes_1 = require("http-status-codes");
const router = express_1.Router();
router.post('/', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    if (req.query.id) {
        console.log('accepting', req.query.id);
        //Flow to add contact request to contacts
        const id = req.query.id;
        console.log('accepting', id);
        let chat = chatService_1.getChatById(id);
        chat.acceptedChat = true;
        socketService_1.sendEventToConnectedSockets('new_chat', chat);
        dataService_1.persistChat(chat);
        res.json(chat);
        return;
    }
});
router.get('/', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    let limit = parseInt(req.query.limit);
    limit = limit > 100 ? 100 : limit;
    const chats = chatService_1.getAcceptedChatsWithPartialMessages(limit);
    res.json(chats);
});
//@TODO will need to use this later
router.get('/chatRequests', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    const returnChats = chatService_1.getChatRequests();
    res.json(returnChats);
});
router.get('/:chatId', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    const chat = dataService_1.getChat(req.params.chatId);
    if (!chat.contacts.some(x => x.id !== config_1.config.userid)) {
        throw new httpError_1.HttpError(http_status_codes_1.StatusCodes.FORBIDDEN);
    }
    res.json(chat);
});
exports.default = router;
