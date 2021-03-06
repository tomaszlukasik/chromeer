const defaultOpts = {
    screenshotFreq: 100
};

const actions = {
    history: (browser, params) => {
        switch (params.action) {
            case 'goto':
                return browser.goto(params.url);
            case 'back':
                return browser.goBack();
            case 'forward':
                return browser.goForward();
            default:
                return Promise.resolve();
        }
    },
    resize: (browser, viewport) => browser.setViewport(viewport),
    mousemove: (browser, { x, y }) => browser.mouseMove(x, y),
    click: (browser, { x, y, button }) => browser.mouseClick(x, y, button),
    dblclick: (browser, { x, y, button }) => browser.mouseClick(x, y, button, 2),
    scroll: (browser, { scrollX, scrollY }) => browser.scrollTo(scrollX, scrollY)
};

function handlers(browser, options) {
    const settings = Object.assign({}, defaultOpts, options);
    const { screenshotFreq } = settings;

    let timeout;
    let socket;

    function stopTimeout() {
        timeout = timeout && clearTimeout(timeout);
    }

    async function sendScreenshot() {
        if (!socket) {
            return;
        }
        try {
            const [buffer, size] = await Promise.all([
                browser.screenshot(),
                browser.getDocumentSize()
            ]);

            socket.volatile.emit('screen', { image: buffer.toString('base64'), size });
            timeout = setTimeout(sendScreenshot, screenshotFreq);
        } catch (error) {
            console.error('Something is already closed', error, error.stack);
        }
    }

    async function handleAction({ type, params }) {
        stopTimeout();
        console.log(`Received action ${type} with params ${JSON.stringify(params)}`);
        if (actions[type]) {
            await actions[type](browser, params);
            if (type !== 'histpry') {
                await sendScreenshot();
            }
        }
    }

    return {
        setSocket: sock => (socket = sock),
        sendScreenshot,
        handlers: {
            action: handleAction,
            disconnect: () => {
                console.log('Disconnecting');
                socket = undefined;
                stopTimeout();
                return browser.close();
            }
        }
    };
}

module.exports = handlers;
