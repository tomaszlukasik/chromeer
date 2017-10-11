const fs = require('fs');
const http = require('http')

const socketIo = require('socket.io');
const { Server: p2p } = require('socket.io-p2p-server');

const headless = require('./headless');
const handlers = require('./handlers');

const PORT = 9090;

const app = http.createServer(handler);
const io = socketIo(app);

io.use(p2p);
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const browser = headless({
    screenshot: { omitBackground: true, type: 'jpeg', quality: 60 }
});

const socketHandlers = handlers(browser);

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
    console.log('Client connected');
    p2p(socket);
    socketHandlers.setSocket(socket);

    await browser.init();
    console.log('Browser ready');
    await browser.goto('https://www.youtube.com/watch?v=PiGr64N3EvE');
    console.log('Page loaded');
    Object.entries(socketHandlers.handlers).map(([event, eventHandler]) => socket.on(event, eventHandler));
});
