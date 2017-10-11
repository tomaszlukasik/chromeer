(function () {
    const throttle = require('lodash.throttle');

    console.info('Welcome to Hack Day 2017!');
    console.info('Chromeer - Remote Browser with an isolation layer');

    const canvas = document.getElementById('viewport');
    const context = canvas.getContext('2d');

    const socket = io('http://localhost:9090');
    const p2p = new P2P(socket);
    const screen = new Image();

    const setCanvasDimension = function () {
        const { innerWidth: width, innerHeight: height } = window;
        console.info(`Set canvas dimension ${width}x${height}`);
        canvas.width = width;
        canvas.height = height;
        socket.emit('resize', { width, height })
    };

    window.onload = setCanvasDimension;
    window.addEventListener("resize", throttle(setCanvasDimension, 500), false);

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
