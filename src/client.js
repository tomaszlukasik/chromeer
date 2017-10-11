'use strict';

const throttle = require('lodash.throttle');
const PresentationLayer = require('./client/presentation');
const TransportLayer = require('./client/transport');
const mapper = require('./client/puppeteer-mapper');

(function () {
    console.info('Welcome to the Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const presentation = PresentationLayer();
    const transport = TransportLayer({ host: 'http://localhost:9090' });

    const updateCanvasDimension = function () {
        const width = window.innerWidth;
        const height = window.innerHeight - presentation.panelHeight;
        transport.emit('resize', { width, height });
        presentation.resize({ width, height });
    };

    const getProxyUrl = () => document.location.hash.substr(1);

    const updateProxiedUrl = (url) => {
        document.location.hash = url;
    };

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

    document.getElementById('panel').addEventListener('submit', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const url = document.querySelector('.value-url').value;
        transport.emit('history', { action: 'goto', url });
    }, true);

    window.addEventListener('hashchange', () => {
        document.querySelector('.value-url').value = getProxyUrl();
    });

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

    window.addEventListener('scroll', throttle((event) => {
        const params = { scrollX: window.scrollX, scrollY: window.scrollY };
        console.log('scroll', params);
        transport.emit('scroll', params)
    }, 500), false);


    // handle server events
    transport.listen('screen', presentation.draw);
    transport.listen('ready', updateCanvasDimension);
    transport.listen('url', updateProxiedUrl);
})();
