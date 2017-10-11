'use strict';

module.exports = function TransportLayer(options) {
    const { host } = options;
    const socket = io(host);

    const listen = (name, fn) => socket.on(name, fn);

    const emit = (type, params) => {
        console.info(`Emit ${type} event`);
        socket.emit('action', { type, params });
    };

    return {
        emit,
        listen
    }
};
