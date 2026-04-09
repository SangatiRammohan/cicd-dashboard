require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const errorHandler  = require('./middleware/errorHandler');
const pipelinesRouter   = require('./routes/pipelines');
const deploymentsRouter = require('./routes/deployments');
const kubernetesRouter  = require('./routes/kubernetes');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready',  (_req, res) => res.json({ status: 'ready' }));  // ADD THIS
  app.use('/api/pipelines',   pipelinesRouter);
  app.use('/api/deployments', deploymentsRouter);
  app.use('/api/kubernetes',  kubernetesRouter);

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);
  return app;
}

module.exports = createApp;