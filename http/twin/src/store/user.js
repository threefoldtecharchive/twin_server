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
exports.updateAvatar = exports.updateLastSeen = exports.updateStatus = exports.getLastSeen = exports.getData = exports.getAvatar = exports.getImage = exports.getStatus = exports.getId = exports.initUserData = exports.setUserData = void 0;
const dataService_1 = require("../service/dataService");
const config_1 = require("../config/config");
const locationService_1 = require("../service/locationService");
let status;
let image;
let id;
let lastSeen;
const setUserData = () => {
    try {
        const userData = dataService_1.getUserdata();
        status = userData.status;
        image = userData.image;
        id = userData.id;
        lastSeen = userData.lastSeen;
    }
    catch (error) {
        console.log("setting default user data");
        status = 'Exploring the new DigitalTwin';
        image = `default`;
        id = config_1.config.userid;
        saveUserData();
    }
};
exports.setUserData = setUserData;
const initUserData = () => {
    console.log("Init set user data");
    exports.setUserData();
};
exports.initUserData = initUserData;
const getId = () => {
    return id;
};
exports.getId = getId;
const getStatus = () => {
    return status;
};
exports.getStatus = getStatus;
const getImage = () => {
    return image;
};
exports.getImage = getImage;
const getAvatar = () => __awaiter(void 0, void 0, void 0, function* () {
    const myLocation = yield locationService_1.getMyLocation();
    return `http://[${myLocation}]/api/user/avatar/${image}`;
});
exports.getAvatar = getAvatar;
const getData = () => {
    return {
        status: status,
    };
};
exports.getData = getData;
const getLastSeen = () => {
    return lastSeen;
};
exports.getLastSeen = getLastSeen;
const saveUserData = () => {
    dataService_1.persistUserdata({
        status: status,
        image: image,
        id: id,
        lastSeen: lastSeen,
    });
};
const updateStatus = (newStatus) => {
    status = newStatus;
    saveUserData();
};
exports.updateStatus = updateStatus;
const updateLastSeen = () => {
    lastSeen = new Date().getTime();
    saveUserData();
};
exports.updateLastSeen = updateLastSeen;
const updateAvatar = (url) => {
    image = url;
    saveUserData();
};
exports.updateAvatar = updateAvatar;
