export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;

    // Use v1 instead of v1beta for better stability with gemini-1.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

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

    // Check if the API returned an error (like an invalid API key or quota limit)
    if (data.error) {
      return res.status(data.error.code || 500).json({ 
        text: `API Error: ${data.error.message}` 
      });
    }

    // Safely extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      res.status(200).json({ text });
    } else {
      // If no text was found, return the full data for debugging
      res.status(200).json({ 
        text: "No response generated.",
        debug: JSON.stringify(data) 
      });
    }

  } catch (e) {
    console.error("Handler Error:", e);
    res.status(500).json({ text: 'Internal Server Error: ' + e.message });
  }
}
