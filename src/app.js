require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const client = require('prom-client');
const errorHandler = require('./middleware/errorHandler');
const pipelinesRouter = require('./routes/pipelines');
const deploymentsRouter = require('./routes/deployments');
const kubernetesRouter = require('./routes/kubernetes');

function createApp() {
  const app = express();

  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5],
    registers: [register],
  });

  const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  });

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
      end({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });
      httpRequestTotal.inc({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });
    });
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', (_req, res) => res.json({ status: 'ready' }));

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use('/api/pipelines', pipelinesRouter);
  app.use('/api/deployments', deploymentsRouter);
  app.use('/api/kubernetes', kubernetesRouter);
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;