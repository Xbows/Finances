import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: system + '\n\n' + userMessage,
    });

    const text = response.text;
    if (text) {
      res.status(200).json({ text });
    } else {
      res.status(200).json({ text: 'No response from AI.' });
    }
  } catch(e) {
    res.status(200).json({ text: 'Error: ' + e.message });
  }
}
