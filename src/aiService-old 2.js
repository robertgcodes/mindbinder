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
    // Add randomization elements to encourage variety
    const timestamp = new Date().toISOString();
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    // Check if the prompt is asking for random/varied content
    const wantsRandom = prompt.toLowerCase().includes('random') || 
                       prompt.toLowerCase().includes('different') ||
                       prompt.toLowerCase().includes('variety');
    
    let enhancedPrompt = prompt;
    
    if (wantsRandom) {
      // Add explicit instruction to avoid repetition
      enhancedPrompt = `${prompt}\n\nIMPORTANT: Please ensure variety in your responses. Avoid commonly given examples or frequently cited items. Draw from the full breadth of available knowledge to provide diverse and interesting responses each time.\n\n(Random seed: ${randomSeed}, Time: ${timestamp})`;
    } else {
      enhancedPrompt = `${prompt}\n\n(Request time: ${timestamp})`;
    }
    
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: enhancedPrompt }],
      temperature: 0.9, // Higher temperature for more variety
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
