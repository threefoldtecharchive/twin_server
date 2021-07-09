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
const express_1 = require("express");
const chatService_1 = require("../service/chatService");
const dataService_1 = require("../service/dataService");
const axios_1 = __importDefault(require("axios"));
const socketService_1 = require("../service/socketService");
const urlService_1 = require("../service/urlService");
const router = express_1.Router();
router.put('/invite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = chatService_1.parseFullChat(req.body);
    dataService_1.persistChat(chat);
    socketService_1.sendEventToConnectedSockets('connectionRequest', chat);
    res.sendStatus(200);
}));
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let preParsedChat = Object.assign(Object.assign({}, req.body), { acceptedChat: true, isGroup: true });
    const chat = chatService_1.parseFullChat(preParsedChat);
    dataService_1.persistChat(chat);
    chat.contacts.forEach((c) => __awaiter(void 0, void 0, void 0, function* () {
        const path = urlService_1.getFullIPv6ApiLocation(c.location, '/group/invite');
        console.log('sending group request to ', path);
        try {
            yield axios_1.default.put(path, chat);
        }
        catch (e) {
            console.log('failed to send group request');
        }
    }));
    res.json({ success: true });
}));
exports.default = router;
