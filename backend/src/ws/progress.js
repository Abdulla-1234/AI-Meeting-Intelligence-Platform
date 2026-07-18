const { WebSocketServer } = require('ws');

let wss;
const clients = new Map();

function initWS(server) {
  wss = new WebSocketServer({ server, perMessageDeflate: false });

  wss.on('connection', (ws, req) => {
    const url      = new URL(req.url, 'http://localhost');
    const meetingId = url.searchParams.get('meetingId');

    if (meetingId) {
      if (!clients.has(meetingId)) clients.set(meetingId, new Set());
      clients.get(meetingId).add(ws);
      console.log(`[WS] Client connected for meeting: ${meetingId}`);
    }

    ws.on('close', () => {
      if (meetingId) clients.get(meetingId)?.delete(ws);
    });
  });

  console.log('✅ WebSocket server ready');
}

function sendProgress(meetingId, data) {
  const room = clients.get(meetingId);
  if (!room) return;
  const payload = JSON.stringify(data);
  room.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload);
  });
}

module.exports = { initWS, sendProgress };