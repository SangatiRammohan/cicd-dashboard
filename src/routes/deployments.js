const express = require('express');
const router = express.Router();
const Deployment = require('../models/Deployment');

router.get('/', async (req, res) => {
  try {
    const deployments = await Deployment.find()
      .sort({ deployedAt: -1 })
      .limit(20);
    res.json(deployments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const doc = await Deployment.create({
      app:       req.body.app || 'unknown',
      namespace: req.body.namespace || 'cicd-platform',
      imageTag:  req.body.imageTag || 'unknown',
      status:    req.body.status || 'unknown',
      deployedBy: req.body.deployedBy || 'manual',
    });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;