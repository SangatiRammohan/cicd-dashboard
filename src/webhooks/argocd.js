const Deployment = require('../models/Deployment');
const logger = require('../utils/logger');

async function handleArgoCDWebhook(req, res, io) {
  const payload = req.body;
  try {
    const app = payload.app || {};
    const status = app.status || {};

    const doc = await Deployment.create({
      app:        app.metadata?.name || 'unknown',
      namespace:  app.spec?.destination?.namespace || 'unknown',
      imageTag:   status.summary?.images?.[0]?.split(':')[1] || 'unknown',
      status:     status.health?.status?.toLowerCase() || 'unknown',
      syncStatus: status.sync?.status?.toLowerCase() || 'unknown',
      revision:   status.sync?.revision?.substring(0, 8) || 'unknown',
      deployedBy: 'argocd'
    });

    logger.info('Deployment saved', { app: doc.app, status: doc.status });
    io.emit('deployment:update', doc);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Failed to save deployment', { error: err.message });
    res.status(500).json({ error: 'Failed to save' });
  }
}

module.exports = { handleArgoCDWebhook };