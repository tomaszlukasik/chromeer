'use strict';

const throttle = require('lodash.throttle');
const PresentationLayer = require('./web/transport');
const TransportLayer = require('./web/transport');

(function () {
    console.info('Welcome to Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const transport = TransportLayer({ host: 'http://localhost:9090' });
    const presentation = PresentationLayer(document.getElementById('viewport'));

    const setCanvasDimension = function () {
        const { innerWidth: width, innerHeight: height } = window;
        transport.emit('resize', { width, height });
        presentation.resize(width, height);
    };

    const bindWindowEvents = function () {
        window.onload = setCanvasDimension;
        window.addEventListener("resize", throttle(setCanvasDimension, 500), false);
        window.addEventListener("mousemove", throttle((event) => {
            const { clientX: x, clientY: y } = event;
            transport.emit('mousemove', { x, y })
        }, 500), false);
    };


    // bootstrap
    bindWindowEvents();
    transport.listen('screen', presentation.draw);
})();
