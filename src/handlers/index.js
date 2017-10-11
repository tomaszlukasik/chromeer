const defaultOpts = {
    screenshotFreq: 50
};

const actions = {
    resize: (browser, viewport) => browser.setViewport(viewport),
    mousemove: (browser, coords) => browser.mouseMove(coords)
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
        if (socket) {
            const buffer = await browser.screenshot();
            socket.volatile.emit('screen', { image: buffer.toString('base64') });
            console.log(`Screenshot sent. Timestamp: ${new Date().getTime()}`);
        }
        timeout = setTimeout(() => sendScreenshot(), screenshotFreq);
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
            disconnect: async () => {
                console.log('Disconnecting');
                stopTimeout();
                return browser.close();
            }
        }
    };
}

module.exports = handlers;
