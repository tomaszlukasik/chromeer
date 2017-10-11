const fs = require('fs');
const http = require('http')

const socketIo = require('socket.io');
const { Server: p2p } = require('socket.io-p2p-server');

const headless = require('./headless');

const app = http.createServer(handler);
const io = socketIo(app);

io.use(p2p);
app.listen(9090);

const browser = headless({
    screenshot: { omitBackground: true, type: 'jpeg', quality: 60 }
});

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
    p2p(socket);

    await browser.init();
    await browser.goto('https://www.youtube.com/watch?v=PiGr64N3EvE');
    const screenshots = setInterval(async () => {
        const buffer = await browser.screenshot();
        socket.volatile.emit('screen', { image: buffer.toString('base64') });
    }, 50);

    socket.on('resize', async ({ width, height }) => {
        console.info(`Set vieport dimension ${width}x${height}`);
        await browser.setViewport({ width, height });
    });

    socket.on('disconnect', async () => {
        clearInterval(screenshots);
        await browser.close();
    });
});
