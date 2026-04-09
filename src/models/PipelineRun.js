const mongoose = require('mongoose');

const pipelineRunSchema = new mongoose.Schema({
  runId:      { type: String, required: true, unique: true },
  branch:     { type: String, required: true },
  commitSha:  { type: String, required: true },
  commitMsg:  { type: String },
  author:     { type: String },
  status:     { type: String, enum: ['pending', 'running', 'success', 'failure'], default: 'pending' },
  imageTag:   { type: String },
  duration:   { type: Number },
  startedAt:  { type: Date, default: Date.now },
  finishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PipelineRun', pipelineRunSchema);