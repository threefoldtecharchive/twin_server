"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = exports.createBase64Signature = exports.createSignature = exports.getKeyPair = exports.encodeHex = exports.decodeHex = exports.objectToUint8Array = exports.objectToBase64 = exports.base64ToUint8Array = exports.uint8ToBase64 = void 0;
const tweetnacl_util_1 = require("tweetnacl-util");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const uint8ToBase64 = (uint8array) => Buffer.from(uint8array).toString('base64');
exports.uint8ToBase64 = uint8ToBase64;
const base64ToUint8Array = (base64) => new Uint8Array(tweetnacl_util_1.decodeBase64(base64));
exports.base64ToUint8Array = base64ToUint8Array;
const objectToBase64 = (data) => Buffer.from(JSON.stringify(data)).toString("base64");
exports.objectToBase64 = objectToBase64;
const objectToUint8Array = (data) => exports.base64ToUint8Array(exports.objectToBase64(data));
exports.objectToUint8Array = objectToUint8Array;
const decodeHex = (hexString) => {
    return new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
};
exports.decodeHex = decodeHex;
const encodeHex = (bytes) => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
};
exports.encodeHex = encodeHex;
const getKeyPair = (userSeed) => {
    const seed = new Uint8Array(tweetnacl_util_1.decodeBase64(userSeed));
    return tweetnacl_1.default.sign.keyPair.fromSeed(seed);
};
exports.getKeyPair = getKeyPair;
const createSignature = (data, secretKey) => {
    if (!secretKey || !data)
        return;
    return tweetnacl_1.default.sign.detached(exports.objectToUint8Array(data), tweetnacl_util_1.decodeBase64(secretKey));
};
exports.createSignature = createSignature;
const createBase64Signature = (data, secretKey) => {
    const signature = exports.createSignature(data, secretKey);
    if (!signature)
        return;
    return exports.uint8ToBase64(signature);
};
exports.createBase64Signature = createBase64Signature;
const verifySignature = (data, signature, publicKey) => {
    return tweetnacl_1.default.sign.detached.verify(exports.objectToUint8Array(data), exports.base64ToUint8Array(signature), tweetnacl_util_1.decodeBase64(publicKey));
};
exports.verifySignature = verifySignature;
