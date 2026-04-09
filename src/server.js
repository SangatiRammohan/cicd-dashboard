require('dotenv').config();
const http     = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const createApp = require('./app');
const logger   = require('./utils/logger');
const { handleGithubWebhook }  = require('./webhooks/github');
const { handleArgoCDWebhook }  = require('./webhooks/argocd');

const PORT = process.env.PORT || 4000;
const app    = createApp();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.post('/webhooks/github',  (req, res) => handleGithubWebhook(req, res, io));
app.post('/webhooks/argocd',  (req, res) => handleArgoCDWebhook(req, res, io));

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