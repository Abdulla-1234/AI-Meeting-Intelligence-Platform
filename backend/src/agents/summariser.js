const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const llm = new ChatGroq({
  apiKey:      process.env.GROQ_API_KEY,
  model:       'llama-3.3-70b-versatile',
  temperature: 0.3,
});

async function summarise(transcript) {
  const response = await llm.invoke([
    new SystemMessage(`You are a meeting summariser. Return ONLY valid JSON, no markdown, no backticks:
{
  "title": "short descriptive meeting title",
  "tldr": "2-3 sentence summary of what happened",
  "key_topics": ["topic1", "topic2", "topic3"],
  "duration_summary": "brief note on how the meeting time was spent"
}`),
    new HumanMessage(`Summarise this meeting transcript:\n\n${transcript}`)
  ]);

  return JSON.parse(response.content);
}

module.exports = { summarise };