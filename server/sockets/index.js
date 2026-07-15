const ScannerService = require('../src/services/scanner/scanner.service');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const scanner = new ScannerService(socket);

    socket.on('start_scan', async (payload = {}) => {
      console.log(`Starting scan for user: ${payload.userId || 'Unknown'}`);
      await scanner.runScan(payload.userId, payload.roleArn);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
