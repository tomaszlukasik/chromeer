const puppeteer = require('puppeteer');

function headless(options) {
    let browser;
    let page;

    const {
        browser: browserOpts = {},
        screenshot: screenshotOpts = {}
    } = options;

    async function init(eventHandlers = {}) {
        browser = browser || await puppeteer.launch(browserOpts);
        if (!page) {
            page = await browser.newPage();
            return Promise.all(Object.entries(eventHandlers).map(([event, cb]) => page.on(event, cb)));
        }
        return Promise.resolve();
    }

    async function close() {
        const pageCopy = page;
        page = undefined;
        await pageCopy.close();
    }

    return {
        init,
        close,
        getUrl: () => page.url(),
        getDocumentSize: () => page.evaluate(() => ({
            height: document.documentElement.scrollHeight,
            width: document.documentElement.scrollWidth
        })),
        goto: url => page.goto(url),
        goBack: () => page.goBack(),
        goForward: () => page.goForward(),
        screenshot: () => page.screenshot(screenshotOpts),
        setViewport: viewport => page.setViewport(viewport),
        mouseMove: (x, y) => page.mouse.move(x, y, 10),
        mouseClick: (x, y, button = 'left', count = 1) => page.mouse.click(x, y, { button, clickCount: count }),
        scrollTo: (x, y) => page.evaluate((xCoord, yCoord) => window.scrollTo(xCoord, yCoord), x, y)
    };
}

module.exports = headless;
