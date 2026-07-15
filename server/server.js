const dotenv = require('dotenv');
// Load environment variables FIRST before any other imports
dotenv.config();

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to match your client URL
    methods: ['GET', 'POST']
  }
});

// Load Socket listeners
require('./sockets')(io);

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
