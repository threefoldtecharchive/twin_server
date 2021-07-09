"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.splitAndTakeLast = function (separator) {
    const parts = this.split(separator);
    return parts[parts.length - 1];
};
String.prototype.removeAfterLastOccurrence = function (separator, include = true) {
    return this.substring(0, this.lastIndexOf(separator) + (include ? 1 : 0));
};
String.prototype.insert = function (index, value) {
    if (index > 0) {
        return this.substring(0, index) + value + this.substr(index);
    }
    return value + this;
};
