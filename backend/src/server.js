require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const http    = require('http');
const path    = require('path');

const { init: pgInit }       = require('./db/postgres');
const { connect: redisConnect } = require('./db/redis');
const { initWS }             = require('./ws/progress');
const uploadRoutes           = require('./api/upload');

const app    = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve frontend build (for production)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Mount API routes
uploadRoutes(app);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

async function main() {
  await redisConnect();
  await pgInit();
  initWS(server);

  // Start transcription worker
  require('./workers/transcription');

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);