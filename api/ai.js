export default async function handler(req, res) {
  try {
    const { system, userMessage } = req.body;
    
    // 1. Clean the API Key (removes hidden spaces/newlines from .env)
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return res.status(500).json({ text: "Error: GEMINI_API_KEY is missing in your environment variables." });
    }

    // 2. Use the STABLE v1 endpoint (Gemini 1.5 Flash is now GA)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

    // 3. If it fails, run a diagnostic to see what's wrong
    if (data.error) {
      if (data.error.code === 404) {
        // Run a quick check to see what models ARE available to this key
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const listData = await listResponse.json();
        const availableModels = listData.models?.map(m => m.name.replace('models/', '')) || [];

        return res.status(404).json({ 
          text: `Error 404: The model 'gemini-1.5-flash' was not found for your key.`,
          available_models_for_your_key: availableModels,
          note: "If the list above is empty, your API Key is invalid or restricted. If 'gemini-1.5-flash' is missing, your region or account tier doesn't support it yet."
        });
      }
      
      return res.status(data.error.code || 500).json({ text: `Google Error: ${data.error.message}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: text || "The AI returned an empty response." });

  } catch (e) {
    res.status(500).json({ text: 'Server Error: ' + e.message });
  }
}
