"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorWrapper_1 = require("../types/errors/errorWrapper");
const http_status_codes_1 = require("http-status-codes");
const errorMiddleware = (error, request, response, next) => {
    var _a;
    try {
        next();
    }
    catch (err) {
        if (error instanceof errorWrapper_1.ErrorWrapper) {
            return response
                .status(error.getHttpStatus())
                .send((_a = error.data) !== null && _a !== void 0 ? _a : { reason: http_status_codes_1.getReasonPhrase(error.getHttpStatus()), message: error.message });
        }
        return response
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .send({ message: error.message });
    }
};
exports.default = errorMiddleware;
