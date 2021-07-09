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
Object.defineProperty(exports, "__esModule", { value: true });
const dataService_1 = require("./../service/dataService");
const express_1 = require("express");
const dataService_2 = require("../service/dataService");
const types_1 = require("../types");
const config_1 = require("../config/config");
const socketService_1 = require("../service/socketService");
const apiService_1 = require("../service/apiService");
const urlService_1 = require("../service/urlService");
const locationService_1 = require("../service/locationService");
const keyService_1 = require("../service/keyService");
const router = express_1.Router();
router.get('/:chatid/:messageid/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @TODO fix this security
    const path = `${config_1.config.baseDir}chats/${req.params.chatid}/files/${req.params.messageid}/${req.params.name}`;
    console.log('Path: ', path);
    res.download(path);
}));
router.post('/:chatid/:messageid', (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatid;
    const messageId = req.params.messageid;
    const fileToSave = req.files.file;
    dataService_2.saveFile(chatId, messageId, fileToSave);
    let myLocation = yield locationService_1.getMyLocation();
    const message = {
        from: config_1.config.userid,
        body: {
            type: req.body.type,
            filename: fileToSave.name,
            url: urlService_1.getFullIPv6ApiLocation(myLocation, `/files/${chatId}/${messageId}/${fileToSave.name}`),
        },
        id: messageId,
        timeStamp: new Date(),
        to: chatId,
        type: types_1.MessageTypes.FILE,
        replies: [],
        signatures: [],
        subject: null,
    };
    socketService_1.sendEventToConnectedSockets('message', message);
    const chat = dataService_2.getChat(chatId);
    console.log('Sending TO: ', chat);
    keyService_1.appendSignatureToMessage(message);
    yield apiService_1.sendMessageToApi(chat.contacts.find(contact => contact.id === chat.adminId).location, message);
    chat.addMessage(message);
    dataService_1.persistChat(chat);
    resp.sendStatus(200);
}));
exports.default = router;
