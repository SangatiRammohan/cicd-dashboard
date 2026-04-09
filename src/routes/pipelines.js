const express = require('express');
const router = express.Router();
const PipelineRun = require('../models/PipelineRun');

router.get('/', async (req, res) => {
  try {
    const runs = await PipelineRun.find()
      .sort({ startedAt: -1 })
      .limit(20);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total   = await PipelineRun.countDocuments();
    const success = await PipelineRun.countDocuments({ status: 'success' });
    const failure = await PipelineRun.countDocuments({ status: 'failure' });
    const avgDur  = await PipelineRun.aggregate([
      { $match: { duration: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);
    res.json({
      total,
      success,
      failure,
      failureRate: total > 0 ? ((failure / total) * 100).toFixed(1) : 0,
      avgDuration: avgDur[0]?.avg ? Math.round(avgDur[0].avg) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;