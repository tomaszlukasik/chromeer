'use strict';

module.exports = function TransportLayer(options) {
    const { host, usePeerConnection, initialViewport } = options;
    const socket = io(host);
    const p2p = new P2P(socket);
    console.log('init')

    p2p.on('ready', (zz) => {
        p2p.usePeerConnection = usePeerConnection;
        console.log('p2p ready')
        emit('resize', initialViewport);
        p2p.emit(null, 'action', { type: 'resize', params: initialViewport });
    });

    p2p.on('peer-msg', function(data){
        console.log(data);
    });

    const listen = (name, fn) => p2p.on(name, fn);

    const emit = (type, params) => {
        console.info(`Emit ${type} event`);
        p2p.emit('action', { type, params });
    };

    return {
        emit,
        listen
    }
};
