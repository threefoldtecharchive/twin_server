"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const errorWrapper_1 = require("./errorWrapper");
class HttpError extends errorWrapper_1.ErrorWrapper {
    constructor() {
        super(...arguments);
        this.getHttpStatus = () => this.status;
    }
}
exports.HttpError = HttpError;
