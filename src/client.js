'use strict';

const throttle = require('lodash.throttle');
const PresentationLayer = require('./client/presentation');
const TransportLayer = require('./client/transport');

const Mapper = {
    button: (button) => button === 0 ? 'left' : button === 1 ? 'middle' : 'right'
};

(function () {
    console.info('Welcome to the Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const presentation = PresentationLayer(document.getElementById('viewport'));
    const transport = TransportLayer({ host: 'http://localhost:9090' });

    const updateCanvasDimension = function () {
        const { innerWidth: width, innerHeight: height } = window;
        transport.emit('resize', { width, height });
        presentation.resize({ width, height });
    };


    // proxy client events
    window.addEventListener('resize', throttle(updateCanvasDimension, 500), false);

    window.addEventListener('mousemove', throttle((event) => transport.emit('mousemove', {
        x: event.pageX,
        y: event.pageY
    }), 500), false);

    window.addEventListener('click', (event) => transport.emit('click', {
        x: event.clientX,
        y: event.clientY,
        button: Mapper.button(event.button)
    }), false);

    window.addEventListener('dblclick', (event) => transport.emit('dblclick', {
        x: event.clientX,
        y: event.clientY,
        button: event.button
    }), false);


    // handle server events
    transport.listen('screen', presentation.draw);
    transport.listen('ready', updateCanvasDimension);
})();
