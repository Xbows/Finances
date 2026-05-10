/**
 * Gemini AI Helper for Plain HTML Projects
 * Usage:
 * 1. Add <script type="module" src="ai.js"></script> to your HTML.
 * 2. Call window.callGemini(systemPrompt, userPrompt) from your other scripts.
 */

import { GoogleGenAI } from "https://esm.run/@google/genai";

// Initialize the API. 
// In AI Studio/Vercel, we often inject the key via environment variables.
// If you are deploying to Vercel, you should handle this in a serverless function 
// to keep your key secret. However, for this HTML-first project:
const API_KEY = ""; // Replace with your key if not using a build-time injection

window.callGemini = async (system, user) => {
  // Use build-time process.env if available, otherwise fallback to constant
  const key = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || API_KEY;
  
  if (!key) {
    console.error("Gemini API Key missing. Please set it in ai.js or as GEMINI_API_KEY env var.");
    return "Error: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI(key);
    const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: user }] }],
      systemInstruction: system,
    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return `Error: ${err.message}`;
  }
};
