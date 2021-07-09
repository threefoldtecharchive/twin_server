"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.createJwtToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const keyStore_1 = require("../store/keyStore");
const config_1 = require("../config/config");
const createJwtToken = (data, exp) => {
    const privateKey = keyStore_1.getPrivateKey();
    return jsonwebtoken_1.sign({
        data: data
    }, Buffer.from(privateKey), { expiresIn: exp, issuer: config_1.config.userid });
};
exports.createJwtToken = createJwtToken;
const verifyJwtToken = (token) => {
    const privateKey = keyStore_1.getPrivateKey();
    try {
        const payload = jsonwebtoken_1.verify(token, Buffer.from(privateKey));
        return [payload, undefined];
    }
    catch (ex) {
        return [undefined, ex];
    }
};
exports.verifyJwtToken = verifyJwtToken;
