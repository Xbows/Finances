export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://finances-weld-mu.vercel.app',
        'X-Title': 'Finances App'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
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
