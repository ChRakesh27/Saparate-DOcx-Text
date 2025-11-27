import mammoth from "mammoth/mammoth.browser";
import { useState } from "react";

const SECTION_MARKER = "===SECTION===";

const isDevanagari = (str) => /[\u0900-\u097F]/.test(str);
const isEnglish = (str) => /[A-Za-z]/.test(str);

const mergeEnglishWithoutDevanagari = (pairs) => {
  const result = [];

  for (const pair of pairs) {
    const hasDev = pair.devanagari && pair.devanagari.trim() !== "";
    const hasEng = pair.english && pair.english.trim() !== "";

    if (!hasDev && hasEng && result.length > 0) {
      const last = result[result.length - 1];
      last.english = (last.english || "") + pair.english;
    } else {
      result.push({ ...pair });
    }
  }

  return result;
};

function parseSuttaSectionsWithMarker(html) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const rawBlocks = Array.from(container.querySelectorAll("p"));

  const blocks = rawBlocks
    .map((el) => {
      const html = el.outerHTML;
      const text = el.innerText.trim();
      if (!text) return null;

      if (text === SECTION_MARKER) {
        return { html, text, type: "MARKER" };
      }

      const type =
        isDevanagari(text) && !isEnglish(text)
          ? "HI"
          : isEnglish(text) && !isDevanagari(text)
          ? "EN"
          : "EN";

      return { html, text, type };
    })
    .filter(Boolean);

  const sections = [];
  let currentSection = null;
  let expectHiTitle = false;
  let expectEnTitle = false;

  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // New section marker
    if (block.type === "MARKER") {
      if (currentSection) {
        // merge English-only pieces inside previous section before pushing
        currentSection.content = mergeEnglishWithoutDevanagari(
          currentSection.content
        );
        sections.push(currentSection);
      }

      currentSection = {
        title: { devanagari: "", english: "" },
        content: [],
      };
      expectHiTitle = true;
      expectEnTitle = false;
      i++;
      continue;
    }

    // Titles
    if (currentSection && expectHiTitle && block.type === "HI") {
      currentSection.title.devanagari = block.html;
      expectHiTitle = false;
      expectEnTitle = true;
      i++;
      continue;
    }

    if (currentSection && expectEnTitle && block.type === "EN") {
      currentSection.title.english = block.html;
      expectEnTitle = false;
      i++;
      continue;
    }

    // Content pairs
    if (currentSection && !expectHiTitle && !expectEnTitle) {
      if (block.type === "HI") {
        const hiHtml = block.html;
        let enHtml = "";

        const next = blocks[i + 1];
        if (next && next.type === "EN") {
          enHtml = next.html;
          i += 2;
        } else {
          i += 1;
        }

        currentSection.content.push({
          devanagari: hiHtml,
          english: enHtml,
        });
        continue;
      }

      // Stray EN: push as English-only content; merger will fix it
      if (block.type === "EN") {
        currentSection.content.push({
          devanagari: "",
          english: block.html,
        });
        i++;
        continue;
      }
    }

    i++;
  }

  if (currentSection) {
    currentSection.content = mergeEnglishWithoutDevanagari(
      currentSection.content
    );
    sections.push(currentSection);
  }

  return sections;
}

export default function DocxSuttaSectionParserWithMarker() {
  const [sections, setSections] = useState([]);
  const [rawHtml, setRawHtml] = useState("");
  const [viewMode, setViewMode] = useState("json"); // "json" | "preview"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setSections([]);
    setRawHtml("");

    try {
      const arrayBuffer = await file.arrayBuffer();

      // DOCX → HTML using mammoth
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
      setRawHtml(html);

      const parsedSections = parseSuttaSectionsWithMarker(html);
      setSections(parsedSections);
    } catch (err) {
      console.error("Error reading/parsing DOCX:", err);
      setError("Failed to parse DOCX. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: "1100px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>DOCX → Sutta Sections (with marker)</h2>
      <p style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>
        In your DOCX, add a line <code>===SECTION===</code> before each
        Hindi/English title pair.
      </p>

      {/* File picker */}
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

      {loading && (
        <p style={{ fontSize: 13, color: "#0f172a", marginTop: 8 }}>
          Processing…
        </p>
      )}
      {error && (
        <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 8 }}>{error}</p>
      )}

      {sections.length > 0 && (
        <>
          {/* Toggle */}
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

          {viewMode === "json" ? (
            <>
              <h3 style={{ marginTop: 24 }}>Sections JSON</h3>
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
                {JSON.stringify(sections, null, 2)}
              </pre>
            </>
          ) : (
            <>
              <h3 style={{ marginTop: 24, marginBottom: 8 }}>Preview</h3>
              <div
                style={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  padding: 16,
                  maxHeight: 500,
                  overflow: "auto",
                  background: "#ffffff",
                }}
              >
                {sections.map((section, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 0",
                      borderBottom:
                        idx < sections.length - 1
                          ? "1px dashed #e2e8f0"
                          : "none",
                    }}
                  >
                    {/* Title */}
                    <div style={{ marginBottom: 8 }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: section.title.devanagari,
                        }}
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 2,
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: section.title.english,
                        }}
                        style={{
                          fontSize: 13,
                          color: "#4b5563",
                        }}
                      />
                    </div>

                    {/* Content */}
                    {section.content.length > 0 && (
                      <div style={{ marginLeft: 8 }}>
                        {section.content.map((pair, i2) => (
                          <div
                            key={i2}
                            style={{
                              marginBottom: 8,
                              paddingLeft: 8,
                              borderLeft: "2px solid #e5e7eb",
                            }}
                          >
                            {pair.devanagari && (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: pair.devanagari,
                                }}
                                style={{ fontSize: 14, marginBottom: 2 }}
                              />
                            )}
                            {pair.english && (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: pair.english,
                                }}
                                style={{ fontSize: 13, color: "#4b5563" }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Optional raw HTML debug */}
      {rawHtml && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontSize: 13 }}>
            Show raw extracted HTML (debug)
          </summary>
          <div
            dangerouslySetInnerHTML={{ __html: rawHtml }}
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 8,
              border: "1px dashed #e5e7eb",
              background: "#f9fafb",
              maxHeight: 300,
              overflow: "auto",
            }}
          />
        </details>
      )}
    </div>
  );
}
