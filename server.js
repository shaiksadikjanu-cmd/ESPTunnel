const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Memory to hold our two VIP connections
let hardwareSocket = null;
let appSocket = null;

wss.on('connection', (ws) => {
    console.log('⚡ New connection to JanuOS Relay!');

    ws.on('message', (data, isBinary) => {
        if (isBinary) return; // We are only routing JSON text right now
        
        try {
            const msg = JSON.parse(data.toString());
            
            // 1. REGISTRATION: Who just connected?
            if (msg.action === 'register') {
                if (msg.role === 'hardware') {
                    hardwareSocket = ws;
                    console.log('✅ ESP32 Hardware Registered!');
                } else if (msg.role === 'app') {
                    appSocket = ws;
                    console.log('✅ Python App Registered!');
                }
                return;
            }

            // 2. ROUTING: Python -> ESP32
            if (msg.target === 'hardware' && hardwareSocket) {
                console.log(`Forwarding command [${msg.command}] to ESP32`);
                hardwareSocket.send(JSON.stringify(msg));
            }
            
            // 3. ROUTING: ESP32 -> Python
            if (msg.target === 'app' && appSocket) {
                console.log(`Forwarding response to Python`);
                appSocket.send(JSON.stringify(msg));
            }

        } catch (e) {
            console.log('Ignored non-JSON message:', data.toString());
        }
    });

    ws.on('close', () => {
        if (ws === hardwareSocket) {
            console.log('❌ ESP32 Hardware Disconnected');
            hardwareSocket = null;
        }
        if (ws === appSocket) {
            console.log('❌ Python App Disconnected');
            appSocket = null;
        }
    });
});

app.get('/', (req, res) => res.send('JanuOS Global Relay is Active! 🚀'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
