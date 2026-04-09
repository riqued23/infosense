import express from "express";
import { translateText, translateBatch } from "../services/translationService.js";

const router = express.Router();
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// POST /api/translate
// Body: { text: string, target: string, source?: string }
router.post("/", async (req, res) => {
  const { text, target, source } = req.body;
  if (!text || !target) {
    return res.status(400).json({ error: "text and target are required" });
  }
  try {
    const result = await translateText(text, target, API_KEY, source);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/translate/batch
// Body: { texts: string[], target: string }
router.post("/batch", async (req, res) => {
  const { texts, target } = req.body;
  if (!Array.isArray(texts) || !target) {
    return res.status(400).json({ error: "texts[] and target are required" });
  }
  try {
    const translations = await translateBatch(texts, target, API_KEY);
    res.json({ translations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;