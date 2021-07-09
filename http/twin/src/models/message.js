"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    constructor(from, to, body, timeStamp, id, type, replies, subject, signatures, updated = undefined) {
        this.from = from;
        this.to = to;
        this.body = body;
        this.timeStamp = timeStamp;
        this.id = id;
        this.type = type;
        this.replies = replies;
        this.subject = subject;
        this.signatures = signatures !== null && signatures !== void 0 ? signatures : [];
        this.updated = updated;
    }
}
exports.default = Message;
