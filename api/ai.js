export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Check if the API key exists to avoid "not found" errors caused by missing auth
    if (!apiKey) {
      return res.status(500).json({ text: "Error: GEMINI_API_KEY is missing from environment variables." });
    }

    // 2. Use 'v1beta' and append '-latest' to the model name. 
    // This is currently the most successful endpoint for Gemini 1.5 Flash.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${system}\n\n${userMessage}` }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will tell us if it's a 403 (Region block), 401 (Bad Key), etc.
      return res.status(data.error.code || 500).json({ 
        text: `API Error (${data.error.code}): ${data.error.message}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      res.status(200).json({ text });
    } else {
      res.status(200).json({ 
        text: "The model did not return a response. Check the debug data.",
        debug: JSON.stringify(data) 
      });
    }

  } catch (e) {
    res.status(500).json({ text: 'Internal Server Error: ' + e.message });
  }
}
