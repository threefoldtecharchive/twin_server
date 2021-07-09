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
exports.getChatfromAdmin = exports.getPublicKey = exports.sendMessageToApi = void 0;
const axios_1 = __importDefault(require("axios"));
const chatService_1 = require("./chatService");
const urlService_1 = require("./urlService");
const sendMessageToApi = (location, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Location: ', location);
    if (message.type !== "READ")
        console.log('newMessage: ', message);
    const url = urlService_1.getFullIPv6ApiLocation(location, '/messages');
    try {
        yield axios_1.default.put(url, message);
    }
    catch (e) {
        console.error(`couldn't send message ${url}`);
    }
});
exports.sendMessageToApi = sendMessageToApi;
const getPublicKey = (location) => __awaiter(void 0, void 0, void 0, function* () {
    const url = urlService_1.getFullIPv6ApiLocation(location, '/user/publickey');
    try {
        const response = yield axios_1.default.get(url);
        return response.data;
    }
    catch (e) {
        console.log(`couldn't get publickey ${url}`);
        return;
    }
});
exports.getPublicKey = getPublicKey;
const getChatfromAdmin = (adminLocation, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = urlService_1.getFullIPv6ApiLocation(adminLocation, `/messages/${chatId}`);
    try {
        console.log('getting chat from ', url);
        const chat = yield axios_1.default.get(url);
        const parsedChat = chatService_1.parseFullChat(chat.data);
        console.log(parsedChat);
        return parsedChat;
    }
    catch (_a) {
        console.log('failed to get chat from admin');
        throw Error;
    }
    throw Error;
});
exports.getChatfromAdmin = getChatfromAdmin;
