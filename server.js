const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const UPLOAD_DIR = './cloud_storage';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

let currentFileStream = null;

wss.on('connection', (ws) => {
    console.log('ESP32 Cloud Drive Connected');
    
    ws.on('message', (data, isBinary) => {
        if (!isBinary) {
            const msg = data.toString();
            if (msg.startsWith("FILE_START:")) {
                const fileName = msg.split(":")[1];
                currentFileStream = fs.createWriteStream(path.join(UPLOAD_DIR, fileName));
                console.log(`Receiving: ${fileName}`);
            } else if (msg === "FILE_END") {
                if (currentFileStream) currentFileStream.end();
                console.log("File saved successfully.");
            }
        } else if (currentFileStream) {
            currentFileStream.write(data);
        }
    });
});

app.get('/', (req, res) => res.send('Cloud Storage Tunnel Active.'));
app.get('/files', (req, res) => res.json(fs.readdirSync(UPLOAD_DIR)));

const PORT = process.env.PORT || 3000;
// This tells Render to show your index.html file when you visit the main URL
app.use(express.static('public')); 

server.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
