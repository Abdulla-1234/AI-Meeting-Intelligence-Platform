require('dotenv').config();
const Bull   = require('bull');
const fs     = require('fs');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const Groq   = require('groq-sdk');
const { pool }         = require('../db/postgres');
const { sendProgress } = require('../ws/progress');
const { runAgents }    = require('../agents/orchestrator');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const transcriptionQueue = new Bull('transcription', {
  redis: { port: 6379, host: '127.0.0.1' }
});

transcriptionQueue.process(async (job) => {
  const { meetingId, filePath } = job.data;
  console.log(`[WORKER] Processing meeting: ${meetingId}`);

  try {
    sendProgress(meetingId, { stage: 'transcribing', progress: 10, message: 'Starting transcription...' });

    // Use Groq Whisper — completely free
    const transcription = await groq.audio.transcriptions.create({
      file:   fs.createReadStream(filePath),
      model:  'whisper-large-v3',
      response_format: 'verbose_json',
    });

    sendProgress(meetingId, { stage: 'transcribing', progress: 55, message: 'Transcription complete...' });

    // Save transcript to DB
    await pool.query(
      'INSERT INTO transcripts (id, meeting_id, content, segments) VALUES ($1,$2,$3,$4)',
      [uuidv4(), meetingId, transcription.text, JSON.stringify(transcription.segments || [])]
    );

    // Update meeting duration
    const duration = Math.round(transcription.duration || 0);
    await pool.query(
      "UPDATE meetings SET duration=$1, status='analyzing', updated_at=NOW() WHERE id=$2",
      [duration, meetingId]
    );

    sendProgress(meetingId, { stage: 'analyzing', progress: 60, message: 'Running AI agents...' });

    // Run all 4 AI agents
    await runAgents(meetingId, transcription.text, sendProgress);

    // Mark complete
    await pool.query(
      "UPDATE meetings SET status='completed', updated_at=NOW() WHERE id=$1",
      [meetingId]
    );

    sendProgress(meetingId, { stage: 'completed', progress: 100, message: 'Analysis complete!' });
    console.log(`[WORKER] Done: ${meetingId}`);

    // Cleanup uploaded file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    console.error('[WORKER ERROR]', err.message);
    await pool.query(
      "UPDATE meetings SET status='failed', updated_at=NOW() WHERE id=$1",
      [meetingId]
    );
    sendProgress(meetingId, { stage: 'failed', progress: 0, error: err.message });
  }
});

transcriptionQueue.on('completed', job => console.log(`[QUEUE] Job ${job.id} completed`));
transcriptionQueue.on('failed',    (job, err) => console.error(`[QUEUE] Job ${job.id} failed:`, err.message));

module.exports = { transcriptionQueue };