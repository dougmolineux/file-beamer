# File Beamer
![Alt text](./image.png)

File Beamer is a simple Node.js application that allows you to send files between machines on the same local network. It consists of two components:

1. **Receiver**: Listens for incoming file transfers and can be named for easy identification.
2. **Sender**: Discovers available receivers on the network and sends files to them.

---

## Features

- **Network Discovery**: Automatically finds all receivers on the same local network.
- **Named Receivers**: Each receiver can be given a custom name for easy identification.
- **Simple File Transfer**: Send files to any discovered receiver with a single command.

---

## Installation

1. **Clone the repository** (if you have one) or create a new directory for the project.

   ```bash
   git clone https://github.com/your-username/file-beamer.git
   cd file-beamer
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install required global packages** (if needed):
   - Ensure Node.js and npm are installed on your machine.

---

## Usage

### 1. Running the Receiver

The receiver listens for incoming file transfer requests and can be given a custom name.

1. Start the receiver:

   ```bash
   node receiver.js
   ```

2. When prompted, enter a name for the receiver:

   ```
   Enter a name for this receiver: Living Room PC
   ```

3. The receiver will start listening for file transfers.

---

### 2. Running the Sender

The sender discovers available receivers on the network and allows you to send files to them.

1. Start the sender:

   ```bash
   node sender.js
   ```

2. The sender will discover all available receivers and display them:

   ```
   Available receivers:
   1: Living Room PC (192.168.1.100:8000)
   2: Office Laptop (192.168.1.101:8000)
   ```

3. Select a receiver by entering its corresponding number:

   ```
   Select a receiver by number: 1
   ```

4. The sender will send the file to the selected receiver.

---

## Example Workflow

### On the Receiver Machine

```bash
node receiver.js
```

- Prompt:

  ```
  Enter a name for this receiver: Living Room PC
  ```

- Output:

  ```
  Receiver name set to: Living Room PC
  Receiver is listening on 192.168.1.100:41234
  HTTP server is listening on port 8000
  ```

### On the Sender Machine

```bash
node sender.js
```

- Output:

  ```
  Available receivers:
  1: Living Room PC (192.168.1.100:8000)
  ```

- Prompt:

  ```
  Select a receiver by number: 1
  ```

- Output:

  ```
  File sent to Living Room PC (192.168.1.100): File uploaded successfully!
  ```

---

## Configuration

- **UDP Port**: The default UDP port for discovery is `41234`. You can change this in both `receiver.js` and `sender.js`.
- **HTTP Port**: The default HTTP port for file transfers is `8000`. You can change this in `receiver.js`.

---

## Future Enhancements

- **Authentication**: Add authentication to secure file transfers.
- **GUI**: Create a graphical user interface for easier interaction.
- **Multiple File Support**: Allow sending multiple files at once.
- **Progress Indicators**: Show progress during file transfers.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

## Contributing

Contributions are welcome! If you'd like to contribute, please:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request.

---

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/file-beamer/issues) on GitHub.

---

Enjoy beaming files across your network! 🚀