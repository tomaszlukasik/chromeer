const puppeteer = require('puppeteer');

function headless(options) {
    let browser;
    let page;

    const {
        browser: browserOpts = {},
        screenshot: screenshotOpts = {}
    } = options;

    async function init() {
        browser = browser || await puppeteer.launch(browserOpts);
        page = page || await browser.newPage();
    }

    async function close() {
        const [pageLoc, browserLoc] = [page, browser];
        page = browser = undefined;
        await pageLoc.close();
        await browserLoc.close();
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
        mouseClick: (x, y, button = 'left', count = 1) => page.mouse.click(x, y, { button, clickCount: count })
    };
}

module.exports = headless;
