import mammoth from "mammoth/mammoth.browser";
import { useState } from "react";
import PalmLeafReader from "./PalmLeafReader";

// Script detection
const isHindi = (str) => /[\u0900-\u097F]/.test(str);
const isEnglish = (str) => /[A-Za-z]/.test(str);

// Pairing function
const buildPairs = (html) => {
  const container = document.createElement("div");
  container.innerHTML = html;

  const blocks = Array.from(container.childNodes).filter((node) => {
    const text = node.innerText?.trim();
    return text && text.length > 0;
  });

  const pairs = [];
  let current = { hindi: "", english: "" };

  blocks.forEach((node) => {
    const text = node.innerText || "";

    // HINDI
    if (isHindi(text) && !isEnglish(text)) {
      // if the current pair is filled, push and start new
      if (current.hindi || current.english) {
        pairs.push(current);
        current = { hindi: "", english: "" };
      }
      current.hindi = node.outerHTML;
    }
    // ENGLISH
    else if (isEnglish(text) && !isHindi(text)) {
      current.english = node.outerHTML;
      pairs.push(current);
      current = { hindi: "", english: "" };
    }
    // Mixed/other (rare): treat as English
    else {
      current.english = node.outerHTML;
      pairs.push(current);
      current = { hindi: "", english: "" };
    }
  });

  // If something remains unpaired
  if (current.hindi || current.english) {
    pairs.push(current);
  }

  return pairs;
};

// pairs: [{ hindi: string, english: string }, ...]
const mergeEnglishWithoutHindi = (pairs) => {
  const result = [];

  for (const pair of pairs) {
    const hasDev = pair.hindi && pair.hindi.trim() !== "";
    const hasEng = pair.english && pair.english.trim() !== "";

    // If no hindi but english exists → append to previous english
    if (!hasDev && hasEng && result.length > 0) {
      const last = result[result.length - 1];
      last.english = (last.english || "") + pair.english;
    } else {
      // normal case – just push
      result.push({ ...pair });
    }
  }

  return result;
};

export default function DocxPairExtractor() {
  const [pairs, setPairs] = useState([]);
  const [html, setHtml] = useState("");
  const [viewMode, setViewMode] = useState("json");

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();

    const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });

    setHtml(value);

    const rawPairs = buildPairs(value);
    const mergedPairs = mergeEnglishWithoutHindi(rawPairs);
    setPairs(mergedPairs);
  };
  return (
    <div style={{ padding: 20, maxWidth: "1000px", margin: "0 auto" }}>
      <h2>DOCX → Hindi/English Pairs</h2>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "1px solid #cbd5f5",
          background: "#eff6ff",
          color: "#1d4ed8",
          cursor: "pointer",
          fontSize: "0.9rem",
          marginBottom: "1rem",
        }}
      >
        <span>📄 Choose DOCX file</span>
        <input
          type="file"
          accept=".docx"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </label>

      {pairs.length > 0 && (
        <>
          <div
            style={{
              display: "inline-flex",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              marginLeft: 12,
              verticalAlign: "middle",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("json")}
              style={{
                padding: "0.35rem 0.9rem",
                fontSize: "0.8rem",
                border: "none",
                cursor: "pointer",
                background: viewMode === "json" ? "#0f172a" : "transparent",
                color: viewMode === "json" ? "#e5e7eb" : "#475569",
              }}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              style={{
                padding: "0.35rem 0.9rem",
                fontSize: "0.8rem",
                border: "none",
                cursor: "pointer",
                background: viewMode === "preview" ? "#0f172a" : "transparent",
                color: viewMode === "preview" ? "#e5e7eb" : "#475569",
              }}
            >
              Preview
            </button>
          </div>
          {viewMode == "preview" ? (
            // 🌴 Palm Leaf Reading Mode
            <PalmLeafReader pairs={pairs} />
          ) : (
            // JSON Mode
            <>
              <h3 style={{ marginTop: 30 }}>JSON Output</h3>
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  padding: 20,
                  borderRadius: 8,
                  maxHeight: 400,
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(pairs, null, 2)}
              </pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
