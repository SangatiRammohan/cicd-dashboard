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

module.exports = router;