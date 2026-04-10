const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  app:        { type: String, required: true },
  namespace:  { type: String, required: true },
  imageTag:   { type: String, required: true },
  status:     { type: String, enum: ['progressing', 'healthy', 'degraded', 'unknown', 'success', 'failed'], default: 'unknown' },
  syncStatus: { type: String, enum: ['synced', 'out_of_sync', 'unknown'], default: 'unknown' },
  revision:   { type: String, default: 'unknown' },
  deployedAt: { type: Date, default: Date.now },
  deployedBy: { type: String, default: 'argocd' }
}, { timestamps: true });

module.exports = mongoose.model('Deployment', deploymentSchema);