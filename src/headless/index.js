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
        await page.close();
        await browser.close();
        page = undefined;
        browser = undefined;
    }

    return {
        init,
        close,
        goto: url => page.goto(url),
        screenshot: () => page.screenshot(screenshotOpts),
        setViewport: viewport => page.setViewport(viewport)
    };
}

module.exports = headless;
