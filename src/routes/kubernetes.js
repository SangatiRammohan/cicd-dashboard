const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../utils/logger');

const NS = process.env.KUBE_NAMESPACE || 'cicd-platform';

router.get('/pods', async (req, res) => {
  try {
    const { stdout } = await execAsync('kubectl get pods -n ' + NS + ' -o json');
    const data = JSON.parse(stdout);
    const pods = data.items.map(p => ({
      name:      p.metadata.name,
      namespace: p.metadata.namespace,
      status:    p.status.phase,
      ready:     p.status.containerStatuses?.[0]?.ready || false,
      restarts:  p.status.containerStatuses?.[0]?.restartCount || 0,
      image:     p.spec.containers[0]?.image || '',
      age:       p.metadata.creationTimestamp
    }));
    res.json(pods);
  } catch (err) {
    logger.error('Failed to get pods', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.get('/deployments', async (req, res) => {
  try {
    const { stdout } = await execAsync('kubectl get deployments -n ' + NS + ' -o json');
    const data = JSON.parse(stdout);
    const deployments = data.items.map(d => ({
      name:      d.metadata.name,
      namespace: d.metadata.namespace,
      replicas:  d.spec.replicas,
      ready:     d.status.readyReplicas || 0,
      image:     d.spec.template.spec.containers[0]?.image || '',
      updatedAt: d.metadata.creationTimestamp
    }));
    res.json(deployments);
  } catch (err) {
    logger.error('Failed to get deployments', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;