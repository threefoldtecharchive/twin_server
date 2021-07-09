"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageOperations = exports.FileTypes = exports.SystemMessageType = exports.MessageTypes = void 0;
var MessageTypes;
(function (MessageTypes) {
    MessageTypes["STRING"] = "STRING";
    MessageTypes["SYSTEM"] = "SYSTEM";
    MessageTypes["GIF"] = "GIF";
    MessageTypes["MESSAGE"] = "MESSAGE";
    MessageTypes["FILE"] = "FILE";
    MessageTypes["FILE_UPLOAD"] = "FILE_UPLOAD";
    MessageTypes["EDIT"] = "EDIT";
    MessageTypes["READ"] = "READ";
    MessageTypes["CONTACT_REQUEST"] = "CONTACT_REQUEST";
    MessageTypes["DELETE"] = "DELETE";
    MessageTypes["GROUP_UPDATE"] = "GROUP_UPDATE";
    MessageTypes["QUOTE"] = "QUOTE";
})(MessageTypes = exports.MessageTypes || (exports.MessageTypes = {}));
var SystemMessageType;
(function (SystemMessageType) {
    SystemMessageType["ADDUSER"] = "ADDUSER";
    SystemMessageType["REMOVEUSER"] = "REMOVEUSER";
    SystemMessageType["JOINED_VIDEOROOM"] = "JOINED_VIDEOROOM";
    SystemMessageType["CONTACT_REQUEST_SEND"] = "CONTACT_REQUEST_SEND";
})(SystemMessageType = exports.SystemMessageType || (exports.SystemMessageType = {}));
var FileTypes;
(function (FileTypes) {
    FileTypes["RECORDING"] = "RECORDING";
    FileTypes["OTHER"] = "OTHER";
})(FileTypes = exports.FileTypes || (exports.FileTypes = {}));
var MessageOperations;
(function (MessageOperations) {
    MessageOperations["NEW"] = "NEW";
    MessageOperations["UPDATE"] = "UPDATE";
    MessageOperations["DELETE"] = "DELETE";
})(MessageOperations = exports.MessageOperations || (exports.MessageOperations = {}));
const test = '';
