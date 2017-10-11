const fs = require('fs');
const http = require('http');

const socketIo = require('socket.io');

const headless = require('./headless');
const handlers = require('./handlers');

const PORT = 9090;

const app = http.createServer(handler);
const io = socketIo(app, { serveClient: false });

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const browser = headless({
    browser: { headless: true, handleSIGINT: false, ignoreHTTPSErrors: true },
    screenshot: { type: 'jpeg', quality: 60 }
});

const socketHandlers = handlers(browser);

const clients = {};
const URL = 'http://schibsted.pl';

function handler(req, res) {
    const path = req.url.split('?')[0];
    fs.readFile(`${__dirname}${path}`, (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end(`Error loading ${req.url}`);
        }

        res.writeHead(200);
        return res.end(data);
    });
}

io.on('connection', async (socket) => {
    clients[socket.id] = socket;
    console.log('Client connected');

    socketHandlers.setSocket(socket);

    await browser.init({
        load: () => {
            const url = browser.getUrl();
            console.log(`emiting ${url}`);
            socket.emit('url', url);
            return socketHandlers.sendScreenshot();
        }
    });
    console.log('Browser ready');
    Object.entries(socketHandlers.handlers).forEach(([event, eventHandler]) => socket.on(event, eventHandler));
    socket.emit('ready');
});
