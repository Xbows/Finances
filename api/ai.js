export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: system + '\n\n' + userMessage }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      res.status(200).json({ text });
    } else {
      res.status(200).json({ text: JSON.stringify(data) });
    }

  } catch(e) {
    res.status(200).json({ text: 'Server error: ' + e.message });
  }
}
