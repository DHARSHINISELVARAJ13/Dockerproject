// Backend/configs/main.js
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openAiApiKey = process.env.OPENAI_API_KEY;

// Keep backend startup resilient: AI features are optional.
const client = openAiApiKey
  ? new OpenAI({
      apiKey: openAiApiKey,
    })
  : null;

// Main function to generate content
async function main(prompt) {
  try {
    if (!client) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add it to backend environment variables to use AI content generation."
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // choose a model you have access to
      messages: [{ role: "user", content: prompt }],
    });

    // Return generated text
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error.message);
    throw new Error("AI content generation failed");
  }
}

export default main;
