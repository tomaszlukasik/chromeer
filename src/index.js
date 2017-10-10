const fs = require('fs');
const app = require('http').createServer(handler);

const io = require('socket.io')(app);
const p2p = require('socket.io-p2p-server').Server;
const puppeteer = require('puppeteer');

io.use(p2p);
app.listen(9090);
const clients = {};

function handler(req, res) {
    fs.readFile(`${__dirname}${req.url}`, (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        return res.end(data);
    });
}

io.on('connection', async (socket) => {
    clients[socket.id] = socket;
    socket.join('screener');
    p2p(socket);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com/watch?v=PiGr64N3EvE');
    const screenshots = setInterval(async () => {
        const buffer = await page.screenshot({ /*fullPage: true, */omitBackground: true, type: 'jpeg', quality: 80 });
        //console.log(`New image ${new Date().getTime()}`);
        socket.volatile.emit('screen', { image: buffer.toString('base64') });
    }, 50);

    socket.on('disconnect', () => {
        clearInterval(screenshots);
        browser.close();
    });
});
