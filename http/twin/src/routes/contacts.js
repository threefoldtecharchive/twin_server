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
const index_1 = require("../types/index");
const messageService_1 = require("./../service/messageService");
const express_1 = require("express");
const contact_1 = __importDefault(require("../models/contact"));
const config_1 = require("../config/config");
const contacts_1 = require("../store/contacts");
const apiService_1 = require("../service/apiService");
const chatService_1 = require("../service/chatService");
const common_1 = require("../common");
const socketService_1 = require("../service/socketService");
const locationService_1 = require("../service/locationService");
const keyService_1 = require("../service/keyService");
const authenticationMiddleware_1 = require("../middlewares/authenticationMiddleware");
const router = express_1.Router();
router.get('/', authenticationMiddleware_1.requiresAuthentication, (req, res) => {
    res.json(contacts_1.contacts);
});
router.post('/', authenticationMiddleware_1.requiresAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const con = req.body;
    const contact = new contact_1.default(con.id, con.location);
    console.log(`Adding contact  ${contact.id}`);
    contacts_1.contacts.push(contact);
    const message = messageService_1.parseMessage(con.message);
    console.log(`creating chat`);
    const myLocation = yield locationService_1.getMyLocation();
    const chat = chatService_1.addChat(contact.id, [contact, new contact_1.default(config_1.config.userid, myLocation)], false, [message], contact.id, true, contact.id);
    // TODO clean this up
    if (!chat) {
        res.sendStatus(200);
        return;
    }
    const url = `/api/messages`;
    const data = {
        id: common_1.uuidv4(),
        to: contact.id,
        body: {
            id: contact.id,
            location: myLocation,
        },
        from: config_1.config.userid,
        type: index_1.MessageTypes.CONTACT_REQUEST,
        timeStamp: new Date(),
        replies: [],
        signatures: [],
        subject: null,
    };
    console.log('sending to ', url);
    console.log(data);
    keyService_1.appendSignatureToMessage(data);
    yield apiService_1.sendMessageToApi(contact.location, data);
    socketService_1.sendEventToConnectedSockets('connectionRequest', chat);
    res.sendStatus(200);
}));
exports.default = router;
