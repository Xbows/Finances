export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage }
        ]
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) {
      res.status(200).json({ text });
    } else {
      res.status(200).json({ text: JSON.stringify(data) });
    }
  } catch(e) {
    res.status(200).json({ text: 'Error: ' + e.message });
  }
}
