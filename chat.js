// Vercel serverless proxy: keeps the Groq key off the browser.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Method not allowed" } });
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: { message: "GROQ_API_KEY is not set" } });
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length > 60)
      return res.status(400).json({ error: { message: "Invalid messages" } });
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", messages }),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: { message: "Upstream error" } });
  }
}
