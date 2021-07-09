"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventToConnectedSockets = exports.startSocketIo = exports.io = void 0;
const chatService_1 = require("./chatService");
const connections_1 = require("../store/connections");
const messageService_1 = require("./messageService");
const types_1 = require("../types");
const dataService_1 = require("./dataService");
const apiService_1 = require("./apiService");
const user_1 = require("../store/user");
const config_1 = require("../config/config");
const keyService_1 = require("./keyService");
const socketio = require('socket.io');
const startSocketIo = (httpServer) => {
    exports.io = socketio(httpServer, {
        cors: {
            origin: '*',
        },
    });
    exports.io.on('connection', (socket) => {
        console.log(`${socket.id} connected`);
        connections_1.connections.add(socket.id);
        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`);
            connections_1.connections.delete(socket.id);
            if (connections_1.connections.getConnections().length === 0) {
                user_1.updateLastSeen();
            }
        });
        socket.on('message', messageData => {
            console.log('new message');
            const newMessage = messageService_1.parseMessage(messageData.message);
            newMessage.from = config_1.config.userid;
            keyService_1.appendSignatureToMessage(newMessage);
            const chat = chatService_1.getChatById(newMessage.to);
            console.log(`internal send message to  ${chat.adminId}`);
            // sendMessage(chat.adminId, newMessage);
            // @todo refactor this
            connections_1.connections.getConnections().forEach((connection) => {
                // if (connection == socket.id) {
                //     // this is me
                //     return
                // }
                exports.io.to(connection).emit('message', newMessage);
                console.log(`send message to socket ${connection}`);
            });
            let location = chat.contacts.find(c => c.id == chat.adminId)
                .location;
            if (newMessage.type === types_1.MessageTypes.READ) {
                messageService_1.handleRead(newMessage);
                apiService_1.sendMessageToApi(location, newMessage);
                return;
            }
            chatService_1.persistMessage(chat.chatId, newMessage);
            apiService_1.sendMessageToApi(location, newMessage);
        });
        socket.on('update_message', messageData => {
            console.log('updatemsgdata', messageData);
            const newMessage = messageService_1.parseMessage(messageData.message);
            messageService_1.editMessage(messageData.chatId, newMessage);
            keyService_1.appendSignatureToMessage(newMessage);
            const chat = chatService_1.getChatById(messageData.chatId);
            let location1 = chat.contacts.find(c => c.id == chat.adminId)
                .location;
            apiService_1.sendMessageToApi(location1, newMessage);
        });
        socket.on('status_update', data => {
            const status = data.status;
            user_1.updateStatus(status);
        });
        socket.on('remove_chat', id => {
            const success = dataService_1.deleteChat(id);
            if (!success) {
                return;
            }
            exports.sendEventToConnectedSockets('chat_removed', id);
        });
        socket.on('block_chat', id => {
            const blockList = dataService_1.getBlocklist();
            if (blockList.includes(id))
                return;
            blockList.push(id);
            dataService_1.persistBlocklist(blockList);
            exports.sendEventToConnectedSockets('chat_blocked', id);
        });
    });
};
exports.startSocketIo = startSocketIo;
const sendEventToConnectedSockets = (event, body) => {
    connections_1.connections.getConnections().forEach((connection) => {
        exports.io.to(connection).emit(event, body);
        console.log(`send message to ${connection}`);
    });
};
exports.sendEventToConnectedSockets = sendEventToConnectedSockets;
