import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "EduPilot API" });
});

/*
  Secure AI endpoint.
  The frontend never receives ANTHROPIC_API_KEY.
*/
app.post("/api/ai", async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "Server AI configuration is missing. Set ANTHROPIC_API_KEY."
      });
    }

    const { messages, system, model, max_tokens = 1024 } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages must be a non-empty array." });
    }

    const safeMaxTokens = Math.min(Math.max(Number(max_tokens) || 1024, 1), 4096);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: model || process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
        max_tokens: safeMaxTokens,
        ...(typeof system === "string" && system.trim() ? { system } : {}),
        messages
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || "Upstream AI request failed."
      });
    }

    return res.json({
      id: data.id,
      model: data.model,
      content: data.content,
      usage: data.usage
    });
  } catch (error) {
    console.error("AI proxy error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`EduPilot server running on http://localhost:${PORT}`);
});
