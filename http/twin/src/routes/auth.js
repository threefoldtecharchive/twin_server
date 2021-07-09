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
const authService_1 = require("../service/authService");
const router = express_1.Router();
router.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in session: ', request.session);
    if (!request.session.loggedIn && process.env.ENVIRONMENT !== 'development') {
        console.log('We dont have a loggedIn session, we shouldnt login now.');
        response.json({ status: false });
    }
    response.json({ status: true });
}));
router.get('/signin', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let loginUrl = yield authService_1.getAppLoginUrl(request, `/api/auth/callback`);
    loginUrl = loginUrl + "&username=" + request.query.username;
    console.log('url: ', loginUrl);
    response.redirect(loginUrl);
}));
router.get('/callback', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const callback = yield authService_1.appCallback(request);
    if (callback && callback !== '/unauthorized') {
        console.log('request.session: ', request.session);
    }
    request.session.save(() => {
        response.redirect(callback);
    });
}));
router.get('/authenticated', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.session.userId || process.env.ENVIRONMENT === 'development') {
        response.send('true');
        return;
    }
    response.send('true');
}));
exports.default = router;
