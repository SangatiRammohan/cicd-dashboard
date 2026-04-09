const crypto = require('crypto');
const PipelineRun = require('../models/PipelineRun');
const logger = require('../utils/logger');

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET || '');
  hmac.update(JSON.stringify(req.body));
  const digest = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

async function handleGithubWebhook(req, res, io) {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'workflow_run') {
    const run = payload.workflow_run;
    try {
      const filter = { runId: String(run.id) };
      const update = {
        runId:      String(run.id),
        branch:     run.head_branch,
        commitSha:  run.head_sha.substring(0, 8),
        commitMsg:  run.head_commit?.message?.split('\n')[0] || '',
        author:     run.head_commit?.author?.name || '',
        status:     run.conclusion === 'success' ? 'success'
                  : run.conclusion === 'failure' ? 'failure'
                  : run.status === 'in_progress' ? 'running' : 'pending',
        duration:   run.updated_at && run.run_started_at
                    ? Math.floor((new Date(run.updated_at) - new Date(run.run_started_at)) / 1000)
                    : null,
        startedAt:  new Date(run.run_started_at),
        finishedAt: run.conclusion ? new Date(run.updated_at) : null
      };

      const doc = await PipelineRun.findOneAndUpdate(filter, update, { upsert: true, new: true });
      logger.info('Pipeline run saved', { runId: doc.runId, status: doc.status });

      io.emit('pipeline:update', doc);
      res.json({ ok: true });
    } catch (err) {
      logger.error('Failed to save pipeline run', { error: err.message });
      res.status(500).json({ error: 'Failed to save' });
    }
  } else {
    res.json({ ok: true, skipped: true });
  }
}

module.exports = { handleGithubWebhook, verifySignature };