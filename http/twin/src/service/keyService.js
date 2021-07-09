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
exports.verifyMessageSignature = exports.appendSignatureToMessage = void 0;
const encryptionService_1 = require("./encryptionService");
const keyStore_1 = require("../store/keyStore");
const apiService_1 = require("./apiService");
const appendSignatureToMessage = (message) => {
    var _a;
    const secretKey = keyStore_1.getPrivateKey();
    if (!secretKey)
        return;
    const signature = encryptionService_1.createBase64Signature(message, secretKey);
    message.signatures = [signature, ...((_a = message.signatures) !== null && _a !== void 0 ? _a : [])];
};
exports.appendSignatureToMessage = appendSignatureToMessage;
const verifyMessageSignature = (contact, message, signature) => __awaiter(void 0, void 0, void 0, function* () {
    const signatureIndex = message.signatures.findIndex(s => s === signature);
    let publicKey = keyStore_1.getPublicKeyFromCache(contact.id);
    if (!publicKey) {
        const base64Key = yield apiService_1.getPublicKey(contact.location);
        if (!base64Key)
            return false;
        publicKey = base64Key;
        keyStore_1.setPublicKeyInCache(contact.id, publicKey);
    }
    const messageWithoutSignature = Object.assign(Object.assign({}, message), { signatures: message.signatures.slice(signatureIndex + 1, message.signatures.length) });
    return encryptionService_1.verifySignature(messageWithoutSignature, signature, publicKey);
});
exports.verifyMessageSignature = verifyMessageSignature;
