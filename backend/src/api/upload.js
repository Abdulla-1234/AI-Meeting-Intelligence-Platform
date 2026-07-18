const multer  = require('multer');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool }              = require('../db/postgres');
const { transcriptionQueue } = require('../workers/transcription');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3','.mp4','.wav','.m4a','.webm'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only audio/video files allowed'));
  }
});

module.exports = function(app) {

  // Upload a new meeting
  app.post('/api/meetings/upload', upload.single('file'), async (req, res) => {
    try {
      const id    = uuidv4();
      const title = req.body.title || req.file.originalname;

      await pool.query(
        'INSERT INTO meetings (id, title, filename, status) VALUES ($1,$2,$3,$4)',
        [id, title, req.file.filename, 'transcribing']
      );

      await transcriptionQueue.add({ meetingId: id, filePath: req.file.path });
      console.log(`[API] Meeting uploaded: ${id}`);

      res.status(201).json({ id, title, status: 'transcribing' });
    } catch (e) {
      console.error('[API ERROR]', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Get all meetings
  app.get('/api/meetings', async (req, res) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM meetings ORDER BY created_at DESC'
      );
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get single meeting with full details
  app.get('/api/meetings/:id', async (req, res) => {
    try {
      const { rows }        = await pool.query('SELECT * FROM meetings    WHERE id=$1',          [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Meeting not found' });
      const { rows: trans } = await pool.query('SELECT * FROM transcripts WHERE meeting_id=$1', [req.params.id]);
      const { rows: anal  } = await pool.query('SELECT * FROM analysis    WHERE meeting_id=$1', [req.params.id]);
      const { rows: acts  } = await pool.query('SELECT * FROM action_items WHERE meeting_id=$1 ORDER BY created_at', [req.params.id]);
      res.json({ ...rows[0], transcript: trans[0] || null, analysis: anal[0] || null, actionItems: acts });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update action item status
  app.patch('/api/action-items/:id', async (req, res) => {
    try {
      const { status } = req.body;
      await pool.query('UPDATE action_items SET status=$1 WHERE id=$2', [status, req.params.id]);
      res.json({ updated: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get all action items across all meetings
  app.get('/api/action-items', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT ai.*, m.title as meeting_title, m.created_at as meeting_date
        FROM action_items ai
        JOIN meetings m ON ai.meeting_id = m.id
        ORDER BY ai.created_at DESC
      `);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

};