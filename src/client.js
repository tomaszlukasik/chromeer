'use strict';

const throttle = require('lodash.throttle');
const PresentationLayer = require('./client/presentation');
const TransportLayer = require('./client/transport');

(function () {
    console.info('Welcome to the Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const presentation = PresentationLayer(document.getElementById('viewport'));
    const transport = TransportLayer({ host: 'http://localhost:9090' });

    const setCanvasDimension = function () {
        const { innerWidth: width, innerHeight: height } = window;
        transport.emit('resize', { width, height });
        presentation.resize({ width, height });
    };

    const bindWindowEvents = function () {
        window.addEventListener("resize", throttle(setCanvasDimension, 500), false);
        window.addEventListener("mousemove", throttle((event) => {
            const { clientY, layerY, offsetY, pageY, screenY, y } = event;
            console.log('mouse:move', JSON.stringify({ clientY, layerY, offsetY, pageY, screenY, y }));
            const { screenX: x, screenY: zy } = event;
            transport.emit('mousemove', { x, y: zy });
        }, 500), false);
    };


    // bootstrap
    bindWindowEvents();
    transport.listen('screen', (data) => {
        presentation.draw(data)
    });
    transport.listen('connect', setCanvasDimension);
})();
