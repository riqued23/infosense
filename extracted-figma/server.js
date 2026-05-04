import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from either this directory or the parent (infosense/) directory
const __dirname = dirname(fileURLToPath(import.meta.url));
for (const envPath of [join(__dirname, ".env"), join(__dirname, "..", ".env")]) {
  try {
    readFileSync(envPath, "utf-8")
      .split("\n")
      .forEach((line) => {
        const eqIdx = line.indexOf("=");
        if (eqIdx > 0) {
          const key = line.slice(0, eqIdx).trim();
          const val = line.slice(eqIdx + 1).trim();
          if (key && !(key in process.env)) process.env[key] = val;
        }
      });
    break;
  } catch { /* file not found, try next */ }
}

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Vite default port

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_URL = "https://translation.googleapis.com/language/translate/v2";

app.post("/api/translate", async (req, res) => {
  const { q, target } = req.body;
  if (!q || !target) {
    return res.status(400).json({ error: "q and target are required" });
  }

  try {
    const response = await fetch(`${GOOGLE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, target, format: "text" }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Translate proxy running on http://localhost:${PORT}`);
  console.log(`API key loaded: ${API_KEY ? "yes (" + API_KEY.slice(0, 8) + "...)" : "NO — set GOOGLE_TRANSLATE_API_KEY"}`);
});
