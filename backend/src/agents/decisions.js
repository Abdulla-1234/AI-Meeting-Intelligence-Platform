const { ChatGroq } = require('@langchain/groq');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const llm = new ChatGroq({
  apiKey:      process.env.GROQ_API_KEY,
  model:       'llama-3.3-70b-versatile',
  temperature: 0.1,
});

async function extractDecisions(transcript) {
  const response = await llm.invoke([
    new SystemMessage(`You are a decision extractor. Return ONLY valid JSON, no markdown, no backticks:
{
  "decisions": [
    {
      "decision": "what was decided",
      "context": "brief context for this decision"
    }
  ],
  "open_questions": [
    {
      "question": "unresolved question",
      "raised_by": "person who raised it or null"
    }
  ]
}`),
    new HumanMessage(`Extract all decisions and open questions from:\n\n${transcript}`)
  ]);

  return JSON.parse(response.content);
}

module.exports = { extractDecisions };