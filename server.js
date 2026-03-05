const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server }); // Attached to the HTTP server

wss.on('connection', (ws) => {
    console.log('Device Connected to Tunnel!');
    ws.send('welcome'); // Test message to ESP32
    
    ws.on('message', (data) => {
        console.log('Received from ESP32:', data.toString());
    });
});

app.get('/', (req, res) => res.send('ESP32 Tunnel is Active!'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
