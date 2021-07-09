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
const express_1 = require("express");
const user_1 = require("../store/user");
const connections_1 = require("../store/connections");
const dataService_1 = require("../service/dataService");
const common_1 = require("../common");
const config_1 = require("../config/config");
const keyStore_1 = require("../store/keyStore");
const router = express_1.Router();
router.get("/publickey", (req, res) => {
    res.json(keyStore_1.getPublicKey());
});
router.get('/getStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isOnline = connections_1.connections.getConnections().length ? true : false;
    const status = user_1.getStatus();
    const avatar = yield user_1.getAvatar();
    const lastSeen = user_1.getLastSeen();
    const data = {
        status,
        avatar,
        isOnline,
        lastSeen,
    };
    // console.log("getStatus",data);
    res.json(data);
}));
router.get('/avatar/:avatarId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.avatarId) {
        res.sendStatus(403);
    }
    let path = `${config_1.config.baseDir}user/avatar-${req.params.avatarId}`;
    res.download(path);
}));
router.post('/avatar', (req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.files.file;
    const avatarId = common_1.uuidv4();
    yield dataService_1.saveAvatar(file, avatarId);
    yield dataService_1.deleteAvatar(user_1.getImage());
    user_1.updateAvatar(avatarId);
    const newUrl = yield user_1.getAvatar();
    resp.status(200).json(newUrl);
}));
exports.default = router;
