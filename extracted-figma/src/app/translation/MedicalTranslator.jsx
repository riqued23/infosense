import { useState } from "react";
import { useTranslation } from "./useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MedicalTranslator() {
  const { translate, language } = useTranslation();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const handleTranslate = async () => {
    const text = input.trim();
    if (!text) return;

    setStatus("loading");
    setOutput("");

    try {
      const result = await translate(text, language);
      setOutput(result);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStatus("idle");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Medical Translator</span>
        <LanguageSwitcher />
      </div>

      <textarea
        style={styles.textarea}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste medical text here..."
        disabled={status === "loading"}
      />

      <div style={styles.footer}>
        <button style={styles.btn} onClick={handleClear}>
          Clear
        </button>
        <button
          style={{ ...styles.btn, ...styles.primaryBtn }}
          onClick={handleTranslate}
          disabled={status === "loading" || !input.trim()}
        >
          {status === "loading" ? "Translating..." : "Translate"}
        </button>
      </div>

      {(output || status === "error") && (
        <div style={styles.output}>
          {status === "error"
            ? "Something went wrong. Check your API key and try again."
            : output}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 640,
    margin: "0 auto",
    fontFamily: "system-ui, sans-serif",
    padding: "24px 16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
  },
  textarea: {
    width: "100%",
    minHeight: 180,
    padding: "12px 14px",
    fontSize: 14,
    lineHeight: 1.65,
    fontFamily: "inherit",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  btn: {
    padding: "7px 18px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  primaryBtn: {
    background: "#0f172a",
    color: "#fff",
    borderColor: "#0f172a",
  },
  output: {
    marginTop: 16,
    padding: "16px 18px",
    fontSize: 14,
    lineHeight: 1.75,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    whiteSpace: "pre-wrap",
    color: "#1e293b",
  },
};