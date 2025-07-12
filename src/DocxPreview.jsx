// src/components/DocxPreview.js
import mammoth from "mammoth";
import { useState } from "react";

const DocxPreview = () => {
  const [htmlContent, setHtmlContent] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("🚀 ~ handleFileChange ~ file.type:", file.type);
    if (
      !file ||
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      alert("Please upload a .docx file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;

      try {
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Subtitle'] => h2:fresh",
              "b => strong",
              "i => em",
            ],
          }
        );
        console.log("🚀 ~ reader.onload= ~ result:", result.value);
        setHtmlContent(result.value);
      } catch (err) {
        console.error("Error converting file:", err);
        setHtmlContent("<p>Failed to convert document.</p>");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4">
      <h2>Upload .docx File</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />

      <div
        className="docx-preview"
        style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
};

export default DocxPreview;
