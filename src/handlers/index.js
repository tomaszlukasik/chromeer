const defaultOpts = {
    screenshotFreq: 50
};

const actions = {
    goto: (browser, { url }) => browser.goto(url),
    goForward: browser => browser.goForward(),
    goBack: browser => browser.goBack(),
    resize: (browser, viewport) => browser.setViewport(viewport),
    mousemove: (browser, { x, y }) => browser.mouseMove(x, y),
    click: (browser, { x, y, button }) => browser.mouseClick(x, y, button),
    dblclick: (browser, { x, y, button }) => browser.mouseClick(x, y, button, 2)
};

function handlers(browser, options) {
    const settings = Object.assign({}, defaultOpts, options);
    const { screenshotFreq } = settings;

    let timeout;
    let socket;

    function stopTimeout() {
        return timeout && clearTimeout(timeout);
    }

    async function sendScreenshot() {
        if (!socket || !browser) {
            return;
        }
        try {
            const [buffer, size] = await Promise.all([
                browser.screenshot(),
                browser.getDocumentSize()
            ]);

            socket.volatile.emit('screen', { image: buffer.toString('base64'), size });
            timeout = setTimeout(() => sendScreenshot(), screenshotFreq);
        } catch (error) {
            console.error('Something is already closed');
        }
    }

    async function handleAction({ type, params }) {
        stopTimeout();
        console.log(`Received action ${type} with params ${JSON.stringify(params)}`);
        if (actions[type]) {
            await actions[type](browser, params);
        }
        await sendScreenshot();
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
