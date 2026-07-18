const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const llm = new ChatGroq({
  apiKey:      process.env.GROQ_API_KEY,
  model:       'llama-3.3-70b-versatile',
  temperature: 0.1,
});

async function analyseSentiment(transcript) {
  const response = await llm.invoke([
    new SystemMessage(`You are a meeting sentiment analyser. Return ONLY valid JSON, no markdown, no backticks:
{
  "overall_tone": "positive or neutral or negative or mixed",
  "energy_level": "high or medium or low",
  "collaboration_score": 7,
  "tension_points": ["any moments of disagreement"],
  "highlights": ["positive moments or breakthroughs"]
}`),
    new HumanMessage(`Analyse the sentiment of this meeting:\n\n${transcript}`)
  ]);

  return JSON.parse(response.content);
}

module.exports = { analyseSentiment };