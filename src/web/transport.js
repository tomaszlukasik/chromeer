'use strict';

module.exports = function TransportLayer(options) {
    const { host, usePeerConnection = true } = options;
    const socket = io(host);
    const p2p = new P2P(socket);

    p2p.on('ready', () => {
        p2p.usePeerConnection = usePeerConnection;
    });

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
