"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePublicKey = exports.getPublicKey = exports.updatePrivateKey = exports.getPrivateKey = exports.initKeys = exports.setPublicKeyInCache = exports.getPublicKeyFromCache = void 0;
const dataService_1 = require("../service/dataService");
const encryptionService_1 = require("../service/encryptionService");
let cache = {};
let privateKey;
let publicKey;
const getPublicKeyFromCache = (userId) => {
    return cache[userId];
};
exports.getPublicKeyFromCache = getPublicKeyFromCache;
const setPublicKeyInCache = (userId, key) => {
    cache = Object.assign(Object.assign({}, cache), { [userId]: key });
};
exports.setPublicKeyInCache = setPublicKeyInCache;
const setKeys = () => {
    publicKey = dataService_1.getKey(dataService_1.Key.Public);
    privateKey = dataService_1.getKey(dataService_1.Key.Private);
};
const initKeys = () => {
    console.log("Init keys");
    try {
        setKeys();
    }
    catch (ex) {
        console.log("Pub and private key not found, first time login no keys yet");
    }
};
exports.initKeys = initKeys;
const getPrivateKey = () => {
    return privateKey;
};
exports.getPrivateKey = getPrivateKey;
const updatePrivateKey = (pk) => {
    const pkString = encryptionService_1.uint8ToBase64(pk);
    dataService_1.saveKey(pkString, dataService_1.Key.Private);
    privateKey = pkString;
};
exports.updatePrivateKey = updatePrivateKey;
const getPublicKey = () => {
    return publicKey;
};
exports.getPublicKey = getPublicKey;
const updatePublicKey = (pk) => {
    const pkString = encryptionService_1.uint8ToBase64(pk);
    dataService_1.saveKey(pkString, dataService_1.Key.Public);
    publicKey = pkString;
};
exports.updatePublicKey = updatePublicKey;
