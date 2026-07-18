require('dotenv').config();
const { pool, init } = require('../src/db/postgres');
const { summarise }        = require('../src/agents/summariser');
const { extractActionItems } = require('../src/agents/actionItems');
const { extractDecisions }   = require('../src/agents/decisions');
const { analyseSentiment }   = require('../src/agents/sentiment');
const { runAgents } = require('../src/agents/orchestrator');

const SAMPLE_TRANSCRIPT = `
Okay let's start the meeting. We need to finish the dashboard by next Friday.
Abdulla will handle the backend API integration. The design team needs to send
the mockup by Wednesday. We decided to go with PostgreSQL over MongoDB for the
database. We also need to set up the CI/CD pipeline. John will do that by end
of this week. Any questions? No? Okay that's it.
`;

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await pool.end();
});

describe('Summariser agent', () => {
  test('returns valid JSON with required fields', async () => {
    const result = await summarise(SAMPLE_TRANSCRIPT);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('tldr');
    expect(result).toHaveProperty('key_topics');
    expect(Array.isArray(result.key_topics)).toBe(true);
  }, 15000);
});

describe('Action item extractor agent', () => {
  test('extracts at least one action item', async () => {
    const result = await extractActionItems(SAMPLE_TRANSCRIPT);
    expect(result).toHaveProperty('action_items');
    expect(result.action_items.length).toBeGreaterThan(0);
  }, 15000);

  test('each action item has a task field', async () => {
    const result = await extractActionItems(SAMPLE_TRANSCRIPT);
    result.action_items.forEach(item => {
      expect(item).toHaveProperty('task');
      expect(typeof item.task).toBe('string');
    });
  }, 15000);
});

describe('Decision extractor agent', () => {
  test('extracts decisions and open questions', async () => {
    const result = await extractDecisions(SAMPLE_TRANSCRIPT);
    expect(result).toHaveProperty('decisions');
    expect(result).toHaveProperty('open_questions');
    expect(Array.isArray(result.decisions)).toBe(true);
  }, 15000);
});

describe('Sentiment analyser agent', () => {
  test('returns valid sentiment structure', async () => {
    const result = await analyseSentiment(SAMPLE_TRANSCRIPT);
    expect(result).toHaveProperty('overall_tone');
    expect(result).toHaveProperty('collaboration_score');
    expect(typeof result.collaboration_score).toBe('number');
  }, 15000);
});

describe('Orchestrator — full pipeline', () => {
  test('runs all 4 agents and saves to database', async () => {
    const meetingId = 'jest-test-' + Date.now();

    await pool.query(
      "INSERT INTO meetings (id, title, status) VALUES ($1,$2,$3)",
      [meetingId, 'Jest Test Meeting', 'analyzing']
    );

    await runAgents(meetingId, SAMPLE_TRANSCRIPT, () => {});

    const { rows: analysis } = await pool.query(
      'SELECT * FROM analysis WHERE meeting_id=$1', [meetingId]
    );
    expect(analysis.length).toBe(1);
    expect(analysis[0].summary).toBeTruthy();

    const { rows: actions } = await pool.query(
      'SELECT * FROM action_items WHERE meeting_id=$1', [meetingId]
    );
    expect(actions.length).toBeGreaterThan(0);

    // Cleanup
    await pool.query('DELETE FROM meetings WHERE id=$1', [meetingId]);
  }, 30000);
});