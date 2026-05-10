export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Safety Check: If the key is missing, Google returns a 404 on the endpoint
    if (!apiKey) {
      return res.status(500).json({ text: "Error: GEMINI_API_KEY is not defined in your environment variables." });
    }

    // 2. The most stable configuration for AI Studio keys:
    // API Version: v1beta
    // Model Name: gemini-1.5-flash (no '-latest' suffix)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `${system}\n\n${userMessage}` }] 
        }]
      })
    });

    const data = await response.json();

    // 3. Detailed Error Handling
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        text: `Google API Error (${data.error.code}): ${data.error.message}`,
        suggestion: "If you see 404, your API key might be for Vertex AI instead of AI Studio, or your region is restricted."
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: text || "The model returned an empty response." });

  } catch (e) {
    res.status(500).json({ text: 'Server Crash: ' + e.message });
  }
}
