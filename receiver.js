const dgram = require('dgram');
const http = require('http');
const fs = require('fs');

const startReceiver = (name, udpPort, httpPort) => {
    const udpServer = dgram.createSocket('udp4');
    const httpServer = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/upload') {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const fileName = `uploaded_file_${Date.now()}.txt`;
                fs.writeFile(fileName, body, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error uploading file');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('File uploaded successfully!');
                    }
                });
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
        }
    });

    udpServer.on('message', (message, remote) => {
        if (message.toString() === 'DISCOVER_FILE_BEAMER') {
            const response = Buffer.from(`FILE_BEAMER_RECEIVER:${name}:${remote.address}:${httpPort}`);
            udpServer.send(response, 0, response.length, remote.port, remote.address, (err) => {
                if (err) console.error('Error sending discovery response:', err);
            });
        }
    });

    udpServer.bind(udpPort, () => {
        udpServer.setBroadcast(true);
        console.log(`Receiver is listening on UDP port ${udpPort}`);
    });

    httpServer.listen(httpPort, () => {
        console.log(`HTTP server is listening on port ${httpPort}`);
    });
};

module.exports = { startReceiver };