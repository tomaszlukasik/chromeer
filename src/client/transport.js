'use strict';

const io = require('socket.io-client');

module.exports = function TransportLayer(options) {
    const { host } = options;
    const socket = io(host);

    const listen = (name, fn) => socket.on(name, fn);

    const emit = (type, params) => {
        console.info(`Emit ${type} event ${JSON.stringify(params)}`);
        socket.emit('action', { type, params });
    };

    return {
        emit,
        listen
    }
};
