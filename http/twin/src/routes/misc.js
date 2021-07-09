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
const types_1 = require("../types");
const chat_1 = __importDefault(require("../models/chat"));
const common_1 = require("../common");
const config_1 = require("../config/config");
const dataService_1 = require("../service/dataService");
const locationService_1 = require("../service/locationService");
const router = express_1.Router();
router.get('/healthcheck', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(200);
}));
router.get('/possibleMessages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(types_1.MessageTypes);
}));
router.get('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = common_1.uuidv4();
    dataService_1.getChat(id);
    const chat = new chat_1.default(id, [], false, [], 'test', false, config_1.config.userid, {});
    dataService_1.persistChat(chat);
    res.json({ success: true });
}));
router.get('/yggdrasil_address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let myLocation = yield locationService_1.getMyLocation();
    res.json(myLocation);
}));
exports.default = router;
