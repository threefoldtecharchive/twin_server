"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorWrapper = void 0;
class ErrorWrapper extends Error {
    constructor(status, message, data) {
        super(message);
        this._status = status;
        this._message = message;
        this._data = data;
    }
    get status() {
        return this._status;
    }
    get message() {
        return this._message;
    }
    get data() {
        return this._data;
    }
}
exports.ErrorWrapper = ErrorWrapper;
