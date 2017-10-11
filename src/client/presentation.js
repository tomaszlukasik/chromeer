'use strict';

module.exports = function PresentationLayer() {
    const canvas = document.getElementById('viewport');
    const background = document.getElementById('background');
    const context = canvas.getContext('2d');
    const screen = new Image();
    const panelHeight = document.getElementById('panel').clientHeight;

    const draw = ({ image = '', size = {} }) => {
        screen.onload = () => context.drawImage(screen, 0, 0);
        screen.src = 'data:image/jpeg;base64,' + image;
        resizeFullPage(size);
    };

    const resize = ({ width, height }) => {
        canvas.width = width;
        canvas.height = height;
    };

    const resizeFullPage = ({ width, height }) => {
        background.style.width = width + 'px';
        background.style.height = height + 'px';
    };

    return {
        draw,
        resize,
        resizeFullPage,
        panelHeight
    }
};
