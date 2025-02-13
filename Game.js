// Real-time Multiplayer Game with WebSockets

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = {};

wss.on('connection', (ws) => {
    const playerId = `player-${Math.random().toString(36).substr(2, 9)}`;
    players[playerId] = { x: 0, y: 0 };

    ws.send(JSON.stringify({ type: 'welcome', playerId, players }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            players[playerId] = data.position;
            broadcast({ type: 'update', playerId, position: data.position });
        }
    });

    ws.on('close', () => {
        delete players[playerId];
        broadcast({ type: 'remove', playerId });
    });
});

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
