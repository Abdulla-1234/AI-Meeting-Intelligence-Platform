const { v4: uuidv4 }        = require('uuid');
const { pool }               = require('../db/postgres');
const { summarise }          = require('./summariser');
const { extractActionItems } = require('./actionItems');
const { extractDecisions }   = require('./decisions');
const { analyseSentiment }   = require('./sentiment');

async function runAgents(meetingId, transcript, sendProgress) {
  console.log(`[AGENTS] Starting parallel analysis for ${meetingId}`);

  // Run all 4 agents in parallel
  const [summary, actionData, decisionData, sentimentData] = await Promise.all([
    summarise(transcript),
    extractActionItems(transcript),
    extractDecisions(transcript),
    analyseSentiment(transcript),
  ]);

  sendProgress(meetingId, { stage: 'analyzing', progress: 88, message: 'Saving results...' });

  // Save combined analysis
  await pool.query(
    `INSERT INTO analysis (id, meeting_id, summary, action_items, decisions, sentiment)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      uuidv4(), meetingId,
      summary.tldr,
      JSON.stringify(actionData.action_items || []),
      JSON.stringify(decisionData),
      JSON.stringify(sentimentData)
    ]
  );

  // Save individual action items
  for (const item of (actionData.action_items || [])) {
    await pool.query(
      `INSERT INTO action_items (id, meeting_id, task, owner, deadline)
       VALUES ($1,$2,$3,$4,$5)`,
      [uuidv4(), meetingId, item.task, item.owner || null, item.deadline || null]
    );
  }

  // Update meeting title from AI
  if (summary.title) {
    await pool.query(
      'UPDATE meetings SET title=$1 WHERE id=$2',
      [summary.title, meetingId]
    );
  }

  console.log(`[AGENTS] Analysis complete for ${meetingId}`);
  console.log(`[AGENTS] Action items found: ${(actionData.action_items || []).length}`);
  console.log(`[AGENTS] Decisions found: ${(decisionData.decisions || []).length}`);
}

module.exports = { runAgents };