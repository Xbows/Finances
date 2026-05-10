export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...`=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: req.body.system + '\n\n' + req.body.userMessage }]
          }]
        })
      }
    );
    const data = await response.json();
    console.log('Gemini raw:', JSON.stringify(data));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.json({ text: 'Error: ' + JSON.stringify(data) });
    } else {
      res.json({ text });
    }
  } catch(e) {
    res.json({ text: 'Server error: ' + e.message });
  }
}
