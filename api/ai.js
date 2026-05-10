export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({ text: "Error: GEMINI_API_KEY is missing." });
    }

    // TESTING WITH THE MOST COMPATIBLE MODEL (gemini-pro)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${userMessage}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        text: `Error (${data.error.code}): ${data.error.message}`,
        diagnostics: "If you still see 404, your API key is invalid. Go to aistudio.google.com and get a new one."
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: text || "Success, but no text returned." });

  } catch (e) {
    res.status(500).json({ text: 'Server Error: ' + e.message });
  }
}
