import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

if (!apiKey) {
  console.error("VITE_CLAUDE_API_KEY is not set in your .env.local file.");
  alert("AI Service is not configured. Please set your VITE_CLAUDE_API_KEY.");
}

const anthropic = new Anthropic({
  apiKey: apiKey,
  // This is required to run in the browser
  dangerouslyAllowBrowser: true,
});

export const getAiResponse = async (prompt) => {
  if (!apiKey) {
    return "Error: VITE_CLAUDE_API_KEY is not configured.";
  }

  try {
    const timestamp = new Date().toISOString();
    const fullPrompt = `${prompt}\n\n(Request time: ${timestamp})`;
    
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: fullPrompt }],
    });
    return msg.content[0].text;
  } catch (error) {
    console.error("Error fetching from Anthropic API:", error);
    // It's helpful to return a user-friendly error message
    if (error instanceof Anthropic.APIError) {
        return `Error from AI Service: ${error.status} ${error.name}`;
    }
    return "Error: Could not get response from AI.";
  }
};
