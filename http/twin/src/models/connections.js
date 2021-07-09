"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Connections {
    constructor(connections) {
        this.socketIds = connections;
    }
    add(connection) {
        this.socketIds.push(connection);
    }
    delete(connection) {
        const index = this.socketIds.findIndex(c => c === connection);
        this.socketIds.splice(index, 1);
    }
    getConnections() {
        return this.socketIds;
    }
}
exports.default = Connections;
