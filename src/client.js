'use strict';

const throttle = require('lodash.throttle');
const PresentationLayer = require('./client/presentation');
const TransportLayer = require('./client/transport');
const mapper = require('./client/puppeteer-mapper');

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

    const getProxyUrl = () => document.location.href.substr(1);

    const getCurrentCoordinates = (event) => ({
        x: event.pageX,
        y: event.pageY - presentation.panelHeight
    });

    // bind browser events
    document.querySelector('.action-history-back').addEventListener('click', (event) => {
        event.stopPropagation();
        transport.emit('history', { action: 'back'});
    }, true);

    document.querySelector('.action-history-forward').addEventListener('click', (event) => {
        event.stopPropagation();
        transport.emit('history', { action: 'forward' });
    }, true);

    document.querySelector('#panel').addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const url = document.querySelector('.value-url').value;
        transport.emit('history', { action: 'goto', url });
    }, true);


    // proxy client events
    window.addEventListener('resize', throttle(updateCanvasDimension, 500), false);

    window.addEventListener('mousemove', throttle((event) => {
        const params = Object.assign({}, getCurrentCoordinates(event));
        transport.emit('mousemove', params);
    }, 500), false);


    window.addEventListener('click', (event) => {
        const params = Object.assign({}, getCurrentCoordinates(event), {
            button: mapper.button(event.button)
        });
        transport.emit('click', params);
    }, false);

    window.addEventListener('dblclick', (event) => {
        const params = Object.assign({}, getCurrentCoordinates(event), {
            button: mapper.button(event.button)
        });
        transport.emit('dblclick', params)
    }, false);


    // handle server events
    transport.listen('screen', presentation.draw);
    transport.listen('ready', updateCanvasDimension);
})();
