'use strict';

module.exports = function PresentationLayer(canvas) {
    const context = canvas.getContext('2d');
    const screen = new Image();

    const draw = (data) => {
        screen.onload = () => context.drawImage(screen, 0, 0, canvas.width, canvas.height);
        screen.src = 'data:image/jpeg;base64,' + data.image;
    };

    const resize = (width, height) => {
        canvas.width = width;
        canvas.height = height;
    };

    return {
        draw,
        resize
    }
};
