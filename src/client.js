'use strict';

(function () {
    const throttle = require('lodash.throttle');

    console.info('Welcome to Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const canvas = document.getElementById('viewport');
    const context = canvas.getContext('2d');

    const socket = io('http://localhost:9090');
    const p2p = new P2P(socket);
    const screen = new Image();

    const emitEvent = function (type, params) {
        console.info(`Emit ${type} event`);
        socket.emit('action', { type, params });
    };

    const setCanvasDimension = function () {
        const { innerWidth: width, innerHeight: height } = window;
        emitEvent('resize', { width, height });
        canvas.width = width;
        canvas.height = height;
    };

    const bindWindowEvents = function () {
        window.onload = setCanvasDimension;
        window.addEventListener("resize", throttle(setCanvasDimension, 500), false);
        window.addEventListener("mousemove", throttle((event) => {
            const { clientX: x, clientY: y } = event;
            emitEvent('mousemove', { x, y })
        }, 500), false);
    };


    // bootstrap
    bindWindowEvents();

    p2p.on('ready', () => {
        p2p.usePeerConnection = true;
    });

    socket.on('screen', function (data) {
        screen.onload = function() {
            context.drawImage(screen, 0, 0, canvas.width, canvas.height);
        };
        screen.src = 'data:image/jpeg;base64,' + data.image;
    });
})();
