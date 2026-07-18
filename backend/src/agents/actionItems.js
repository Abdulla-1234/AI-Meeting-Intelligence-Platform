const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const llm = new ChatGroq({
  apiKey:      process.env.GROQ_API_KEY,
  model:       'llama-3.3-70b-versatile',
  temperature: 0.1,
});

async function extractActionItems(transcript) {
  const response = await llm.invoke([
    new SystemMessage(`You are an action item extractor. Return ONLY valid JSON, no markdown, no backticks:
{
  "action_items": [
    {
      "task": "clear description of what needs to be done",
      "owner": "person responsible or null",
      "deadline": "deadline mentioned or null",
      "priority": "high or medium or low"
    }
  ]
}`),
    new HumanMessage(`Extract all action items from this transcript:\n\n${transcript}`)
  ]);

  return JSON.parse(response.content);
}

module.exports = { extractActionItems };