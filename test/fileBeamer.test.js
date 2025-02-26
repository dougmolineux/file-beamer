const axios = require('axios');
const dgram = require('dgram');
const fs = require('fs');
const http = require('http');
const { startReceiver } = require('../receiver');
const { discoverReceivers, sendFile } = require('../sender');

// Constants for testing
const TEST_PORT = 41234; // UDP port for discovery
const TEST_HTTP_PORT = 8002; // Port for the test HTTP server
const RECEIVER_HTTP_PORT = 8003; // Port for the receiver's HTTP server
const TEST_FILE_PATH = '../test-file.txt'; // Test file to send
const TEST_RECEIVER_NAME = 'Test Receiver';

// Utility function to start an HTTP server for testing
function startHttpServer() {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            if (req.method === 'POST' && req.url === '/upload') {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('File uploaded successfully!');
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not found');
            }
        });

        server.on('error', (err) => {
            reject(err);
        });

        server.listen(TEST_HTTP_PORT, () => {
            console.log(`Test HTTP server listening on port ${TEST_HTTP_PORT}`);
            resolve(server);
        });
    });
}

// Utility function to stop an HTTP server
function stopHttpServer(server) {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                console.log('Test HTTP server stopped');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

// Utility function to create a test file
function createTestFile() {
    fs.writeFileSync(TEST_FILE_PATH, 'This is a test file.');
}

// Utility function to delete the test file
function deleteTestFile() {
    if (fs.existsSync(TEST_FILE_PATH)) {
        fs.unlinkSync(TEST_FILE_PATH);
    }
}

// Test suite for File Beamer
describe('File Beamer', () => {

    jest.setTimeout(15000);

    let httpServer;
    let udpClient;

    // Increase timeout for beforeAll hook
    beforeAll(async () => {
        jest.setTimeout(10000); // Increase timeout to 10 seconds

        try {
            // Start a test HTTP server
            httpServer = await startHttpServer();

            // Create a test file
            createTestFile();

            // Start the receiver
            startReceiver(TEST_RECEIVER_NAME, TEST_PORT, RECEIVER_HTTP_PORT);

            // Create a UDP client for testing
            udpClient = dgram.createSocket('udp4');
        } catch (err) {
            console.error('Error in beforeAll:', err);
            throw err;
        }
    });

    afterAll(async () => {
        await stopHttpServer(httpServer);
        deleteTestFile();

        if (udpClient) {
            udpClient.close(() => {
                console.log('UDP client closed');
            });
        }
    });

    // Test the receiver's discovery response
    test('Receiver responds to discovery requests', (done) => {
        udpClient.on('message', (message) => {
            const response = message.toString();
            console.log('Received discovery response:', response);
            expect(response).toContain('FILE_BEAMER_RECEIVER');
            expect(response).toContain(TEST_RECEIVER_NAME);
            done();
        });

        // Send a discovery message
        const discoveryMessage = Buffer.from('DISCOVER_FILE_BEAMER');
        udpClient.send(discoveryMessage, 0, discoveryMessage.length, TEST_PORT, '127.0.0.1');
    });

    // Test the sender's ability to discover receivers
    test('Sender discovers receivers', async () => {
        const receivers = await discoverReceivers(TEST_PORT);
        console.log('Discovered receivers:', receivers);
        expect(receivers.length).toBeGreaterThan(0);
        expect(receivers[0].name).toBe(TEST_RECEIVER_NAME);
    });

    // Test the sender's ability to send a file
    test('Sender sends a file to the receiver', async () => {
        const receivers = await discoverReceivers(TEST_PORT);
        console.log('Discovered receivers:', receivers);
        expect(receivers.length).toBeGreaterThan(0);

        const receiver = receivers[0];
        console.log('Sending file to receiver:', receiver);

        const response = await sendFile(receiver, TEST_FILE_PATH);
        expect(response).toBe('File uploaded successfully!');
    });
});