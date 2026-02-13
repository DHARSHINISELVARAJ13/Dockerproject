// Backend/configs/main.js
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if API key is set
if (!process.env.OPEN_API_KEY) {
  throw new Error(
    "❌ OPENAI_API_KEY is not set in your .env file. Please add it and restart the server."
  );
}

// Create OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

// Main function to generate content
async function main(prompt) {
  try {
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
