// sender.js
const dgram = require('dgram');
const axios = require('axios');
const fs = require('fs');

const discoverReceivers = (udpPort) => {
    return new Promise((resolve) => {
        const receivers = [];
        const udpClient = dgram.createSocket('udp4');

        // Bind to a port to receive responses
        udpClient.bind(() => {
            udpClient.setBroadcast(true);
        });

        udpClient.on('message', (message, remote) => {
            const response = message.toString();
            console.log('🟢 Discovery response:', response);
            if (response.startsWith('FILE_BEAMER_RECEIVER')) {
                const [_, name, ip, port] = response.split(':');
                receivers.push({ name, ip, port: parseInt(port) });
            }
        });

        // Send discovery to localhost instead of broadcast for testing
        const discoveryMessage = Buffer.from('DISCOVER_FILE_BEAMER');
        udpClient.send(discoveryMessage, 0, discoveryMessage.length, udpPort, '127.0.0.1');

        setTimeout(() => {
            udpClient.close();
            resolve(receivers);
        }, 3000);
    });
};

const sendFile = async (receiver, filePath) => {
    const url = `http://${receiver.ip}:${receiver.port}/upload`;
    const fileStream = fs.createReadStream(filePath);

    try {
        const response = await axios.post(url, fileStream, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error sending file to ${receiver.name}: ${error.message}`);
    }
};

module.exports = { discoverReceivers, sendFile };