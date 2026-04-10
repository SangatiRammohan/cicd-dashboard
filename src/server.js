require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const createApp = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 4000;

const io = new Server({ cors: { origin: '*' } });
const app = createApp(io);
const server = http.createServer(app);
io.attach(server);

io.on('connection', (socket) => {
  logger.info('Client connected', { id: socket.id });
  socket.on('disconnect', () => logger.info('Client disconnected', { id: socket.id }));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connected');
    server.listen(PORT, () => {
      logger.info('Dashboard server started', { port: PORT });
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed', { error: err.message });
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down');
  await mongoose.disconnect();
  server.close(() => process.exit(0));
});