/*const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });



wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.send(JSON.stringify({ message: "Connected to WebSocket signaling server" }));
});

console.log("WebSocket server is running on ws://localhost:3000");*/


const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const rooms = {};


wss.on('connection', (socket) => {
    socket.on('message', (msg) => {
        const data = JSON.parse(msg);

        if (data.type === 'join') {
            const room = data.room;
            if (!rooms[room]) {
                rooms[room] = [];
            }
            rooms[room].push(socket);
            socket.room = room;

            console.log(`User joined room: ${room}`);
            return;
        }

        // Forward offer/answer/candidate to everyone else in the room
        const room = socket.room;
        if (rooms[room]) {
            rooms[room].forEach(client => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });

    socket.on('close', () => {
        const room = socket.room;
        if (rooms[room]) {
            rooms[room] = rooms[room].filter(s => s !== socket);
            if (rooms[room].length === 0) delete rooms[room];
        }
    });
});

console.log("WebSocket signaling server running on ws://localhost:3000");


