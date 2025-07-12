import mammoth from "mammoth";
import { useState } from "react";

// Utility: Extract styled Chinese and English HTML
const extractFormattedChineseEnglish = (html) => {
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = html;

  const chineseNodes = [];
  const englishNodes = [];

  const isChinese = (text) => /[\u4e00-\u9fff]/.test(text);
  const isEnglish = (text) => /[a-zA-Z]/.test(text);

  const traverse = (node, collector, checker) => {
    if (node.nodeType === Node.TEXT_NODE && checker(node.textContent)) {
      const span = document.createElement("span");
      span.innerHTML = node.textContent;
      collector.push(span.outerHTML);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const cloned = node.cloneNode(false);
      const innerFragments = [];

      node.childNodes.forEach((child) => {
        const inner = [];
        traverse(child, inner, checker);
        inner.forEach((childHtml) => {
          const div = document.createElement("div");
          div.innerHTML = childHtml;
          div.childNodes.forEach((x) => cloned.appendChild(x));
        });
      });

      if (cloned.innerHTML.trim()) {
        collector.push(cloned.outerHTML);
      }
    }
  };

  tempContainer.childNodes.forEach((node) => {
    traverse(node, chineseNodes, isChinese);
    traverse(node, englishNodes, isEnglish);
  });

  return {
    chineseHtml: chineseNodes.join(""),
    englishHtml: englishNodes.join(""),
  };
};

const DocxSplitCnEn = () => {
  const [activeTab, setActiveTab] = useState("full");
  const [previewHtml, setPreviewHtml] = useState("");
  const [chineseHtml, setChineseHtml] = useState("");
  const [englishHtml, setEnglishHtml] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".docx")) {
      alert("Please upload a .docx file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;

      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        setPreviewHtml(html);

        const { chineseHtml, englishHtml } =
          extractFormattedChineseEnglish(html);
        setChineseHtml(chineseHtml);
        setEnglishHtml(englishHtml);
      } catch (error) {
        console.error("Error parsing .docx:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const renderTabContent = () => {
    const style = {
      border: "1px solid #ccc",
      padding: 20,
      background: "#fff",
      minHeight: "300px",
    };

    if (activeTab === "full") {
      return (
        <div style={style} dangerouslySetInnerHTML={{ __html: previewHtml }} />
      );
    } else if (activeTab === "chinese") {
      return (
        <div style={style} dangerouslySetInnerHTML={{ __html: chineseHtml }} />
      );
    } else if (activeTab === "english") {
      return (
        <div style={style} dangerouslySetInnerHTML={{ __html: englishHtml }} />
      );
    }
    return null;
  };

  return (
    <div
      style={{
        fontFamily: `'Segoe UI', 'Noto Sans SC', 'Microsoft YaHei', sans-serif`,
        padding: "20px",
      }}
    >
      <h2>Upload .docx</h2>
      <input type="file" accept=".docx" onChange={handleFileUpload} />

      {/* Tabs */}
      <div style={{ display: "flex", marginTop: "30px", gap: "10px" }}>
        <button
          onClick={() => setActiveTab("full")}
          style={{
            padding: "10px",
            backgroundColor: activeTab === "full" ? "#ddd" : "#f5f5f5",
          }}
        >
          📄 Full Preview
        </button>
        <button
          onClick={() => setActiveTab("chinese")}
          style={{
            padding: "10px",
            backgroundColor: activeTab === "chinese" ? "#ddd" : "#f5f5f5",
          }}
        >
          🈶 Chinese Only
        </button>
        <button
          onClick={() => setActiveTab("english")}
          style={{
            padding: "10px",
            backgroundColor: activeTab === "english" ? "#ddd" : "#f5f5f5",
          }}
        >
          🔤 English Only
        </button>
      </div>

      {/* Tab content */}
      <div style={{ marginTop: "20px" }}>{renderTabContent()}</div>
    </div>
  );
};

export default DocxSplitCnEn;
