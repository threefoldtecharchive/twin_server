"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresAuthentication = void 0;
/**
 * Handles authentication check
 * @param error
 * @param request
 * @param response
 * @param next
 */
const requiresAuthentication = (error, request, response, next) => {
    // if (!request?.session?.userId && process.env.ENVIRONMENT !== 'development') {
    //     throw new HttpError(StatusCodes.UNAUTHORIZED)
    // }
    next();
};
exports.requiresAuthentication = requiresAuthentication;
