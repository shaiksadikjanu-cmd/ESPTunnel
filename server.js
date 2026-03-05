const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let esp32Socket = null;

// 1. WebSocket Endpoint (ESP32 connects here)
wss.on('connection', (ws) => {
    console.log('ESP32 Connected!');
    esp32Socket = ws;

    ws.on('close', () => {
        console.log('ESP32 Disconnected');
        esp32Socket = null;
    });
});

// 2. Public Web Endpoint (You visit this URL)
app.get('/command/:action', async (req, res) => {
    if (!esp32Socket) return res.status(503).send('ESP32 not connected');

    const action = req.params.action; // e.g., "on", "off", "status"
    
    // Send command to ESP32
    esp32Socket.send(action);

    // Wait for acknowledgement (Simplified)
    res.send(`Command '${action}' sent to ESP32.`);
});

app.get('/', (req, res) => res.send('ESP32 Tunnel Online. Connect ESP32 via WebSocket.'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Tunnel running on port ${PORT}`));
