export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    
    // 1. Check if the key is actually loading
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ text: "CRITICAL ERROR: The environment variable 'GEMINI_API_KEY' is empty or undefined. Make sure it is set in your .env file and restart your server." });
    }

    // 2. DIAGNOSTIC: Try to list available models to see what your key is allowed to use
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listData.error) {
      return res.status(listData.error.code || 500).json({ 
        text: `The API Key itself is failing. Google says: ${listData.error.message}`,
        help: "Check if you are using a Vertex AI key by mistake. You MUST use a key from https://aistudio.google.com/"
      });
    }

    // 3. If we got here, the key is valid. Let's try the most stable endpoint:
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${userMessage}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
       return res.status(data.error.code).json({ 
         text: `Model Error: ${data.error.message}`,
         available_models: listData.models?.map(m => m.name) || "None found"
       });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: text || "Success, but empty response." });

  } catch (e) {
    res.status(500).json({ text: 'Server Error: ' + e.message });
  }
}
