const dgram = require('dgram');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

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

const main = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Step 1: Discover receivers
    console.log('Scanning for receivers...');
    const receivers = await discoverReceivers(41234);

    if (receivers.length === 0) {
        console.log('No receivers found on the network.');
        rl.close();
        return;
    }

    // Step 2: Prompt the user to select a receiver
    console.log('Available receivers:');
    receivers.forEach((receiver, index) => {
        console.log(`${index + 1}: ${receiver.name} (${receiver.ip}:${receiver.port})`);
    });

    rl.question('Select a receiver by number: ', async (answer) => {
        const selectedIndex = parseInt(answer) - 1;

        if (selectedIndex < 0 || selectedIndex >= receivers.length) {
            console.log('Invalid selection.');
            rl.close();
            return;
        }

        const selectedReceiver = receivers[selectedIndex];
        console.log(`Selected receiver: ${selectedReceiver.name} (${selectedReceiver.ip}:${selectedReceiver.port})`);

        // Step 3: Prompt the user to enter the file path
        rl.question('Enter the path of the file to send: ', async (filePath) => {
            if (!fs.existsSync(filePath)) {
                console.log('File does not exist.');
                rl.close();
                return;
            }

            // Step 4: Send the file
            try {
                console.log(`Sending file to ${selectedReceiver.name}...`);
                const response = await sendFile(selectedReceiver, filePath);
                console.log('File sent successfully:', response);
            } catch (error) {
                console.error('Error sending file:', error.message);
            } finally {
                rl.close();
            }
        });
    });
};

// Export functions for testing
module.exports = { discoverReceivers, sendFile };

// Run the main function if the script is executed directly
if (require.main === module) {
    main();
}