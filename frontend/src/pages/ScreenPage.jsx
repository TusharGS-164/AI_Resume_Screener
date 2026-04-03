import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import API from "../api";

import {
  Upload,
  X,
  FileText,
  Loader,
  CheckCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--bg-3)",
  border: "1px solid var(--border-2)",
  borderRadius: "var(--radius)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--text-2)",
  marginBottom: 7,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export default function ScreenPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...accepted.filter((f) => !existing.has(f.name))];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const removeFile = (name) =>
    setFiles((f) => f.filter((x) => x.name !== name));

  const submit = async () => {
    if (!title.trim()) {
      setError("Please enter a session title");
      return;
    }
    if (jd.trim().length < 20) {
      setError("Please enter a job description (at least 20 characters)");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one resume");
      return;
    }
    setError("");
    setLoading(true);
    setProgress(
      `Analyzing ${files.length} resume${files.length > 1 ? "s" : ""} with Gemini AI...`,
    );
    const formData = new FormData();
    formData.append("title", title);
    formData.append("job_description", jd);
    files.forEach((f) => formData.append("files", f));
  try {
  const res = await API.post("/api/screen/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  navigate(`/sessions/${res.data.session_id}`);
} catch (err) {
  setError(
    err.response?.data?.detail ||
      "Screening failed. Check your Gemini API key in the backend .env file."
  );
  setLoading(false);
  setProgress("");
}
  };

  const readyChecks = [
    {
      label: "Session title",
      ok: title.trim().length > 0,
      value: title.trim() || "—",
    },
    {
      label: "Job description",
      ok: jd.trim().length >= 20,
      value:
        jd.trim().length > 0
          ? `${jd.split(/\s+/).filter(Boolean).length} words`
          : "Not entered",
    },
    {
      label: "Resumes",
      ok: files.length > 0,
      value:
        files.length > 0
          ? `${files.length} file${files.length > 1 ? "s" : ""}`
          : "None uploaded",
    },
    { label: "AI model", ok: true, value: "Gemini 1.5 Flash" },
  ];

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1500, margin: "0 auto" }}>
      {/* Header */}
      <div className="animate-up" style={{ marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          New screening
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            color: "var(--text)",
            lineHeight: 1,
          }}
        >
          Find your best <em style={{ color: "var(--gold)" }}>candidates</em>
        </h1>
      </div>

      {error && (
        <div
          className="animate-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--red-bg)",
            border: "1px solid var(--red-border)",
            borderRadius: "var(--radius)",
            color: "var(--red)",
            fontSize: 13,
            marginBottom: "1.5rem",
          }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "2em",
          alignItems: "stretch",
        }}
      >
        {/* Left - form */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          className="animate-up"
        >
          {/* Title */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              minWidth:"500px"
            }}
          >
            <label style={labelStyle}>Session title</label>
            <input
              style={inputStyle}
              placeholder="e.g. Senior Backend Engineer — Q1 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(201,169,110,0.5)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
            />
          </div>

          {/* Job description */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 7,
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>
                Job description
              </label>
              <span
                style={{
                  fontSize: 12,
                  color:
                    jd.trim().length >= 20 ? "var(--green)" : "var(--text-3)",
                }}
              >
                {jd.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              style={{
                ...inputStyle,
                fontSize: 15,
                minHeight: 280,
                resize: "vertical",
                lineHeight: 1.7,
                flex:1
              }}
              placeholder="Paste the full job description — required skills, experience, responsibilities, tech stack..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(201,169,110,0.5)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
            />
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
              More detail = more accurate AI matching
            </p>
          </div>

          {/* Upload zone */}
         
        </div>

        {/* Right - checklist + submit */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "sticky",
            top: "2rem",
          }}
          className="animate-up"
        >
          <div
             style={{
               background: "var(--surface)",
               border: "1px solid var(--border)",
               borderRadius: "var(--radius-lg)",
               padding: "1.25rem",
               minWidth:"500px"
             }}
           >
             <label style={labelStyle}>Upload resumes</label>
             <div
               {...getRootProps()}
               style={{
                 border: `1.5px dashed ${isDragActive ? "var(--gold)" : "var(--border-2)"}`,
                 borderRadius: "var(--radius-lg)",
                 padding: "2rem 1.5rem",
                 textAlign: "center",
                 cursor: "pointer",
                 background: isDragActive ? "var(--gold-glow)" : "var(--bg-3)",
                 transition: "all 0.2s",
               }}
             >
               <input {...getInputProps()} />
               <div
                 style={{
                   width: 44,
                   height: 44,
                   borderRadius: "50%",
                   background: isDragActive ? "var(--gold-dim)" : "var(--bg-4)",
                   border: `1px solid ${isDragActive ? "rgba(201,169,110,0.4)" : "var(--border-2)"}`,
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   margin: "0 auto 12px",
                   transition: "all 0.2s",
                 }}
               >
                 <Upload
                   size={18}
                   color={isDragActive ? "var(--gold)" : "var(--text-3)"}
                 />
               </div>
               <div
                 style={{
                   fontWeight: 500,
                   fontSize: 14,
                   color: isDragActive ? "var(--gold)" : "var(--text)",
                 }}
               >
                 {isDragActive ? "Drop to upload" : "Drag & drop resumes here"}
               </div>
               <div
                 style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}
               >
                 or{" "}
                 <span style={{ color: "var(--gold)", fontWeight: 500 }}>
                   browse files
                 </span>{" "}
                 — PDF, DOCX, TXT
               </div>
             </div>
 
             {files.length > 0 && (
               <div
                 style={{
                   marginTop: 12,
                   display: "flex",
                   flexDirection: "column",
                   gap: 6,
                   maxHeight: 220,
                   overflowY: "auto",
                 }}
               >
                 {files.map((f) => (
                   <div
                     key={f.name}
                     style={{
                       display: "flex",
                       alignItems: "center",
                       gap: 10,
                       padding: "9px 12px",
                       background: "var(--bg-3)",
                       borderRadius: "var(--radius)",
                       border: "1px solid var(--border)",
                     }}
                   >
                     <div
                       style={{
                         width: 28,
                         height: 28,
                         borderRadius: 6,
                         background: "var(--blue-bg)",
                         border: "1px solid var(--blue-border)",
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         flexShrink: 0,
                       }}
                     >
                       <FileText size={13} color="var(--blue)" />
                     </div>
                     <span
                       style={{
                         flex: 1,
                         fontSize: 12,
                         overflow: "hidden",
                         textOverflow: "ellipsis",
                         whiteSpace: "nowrap",
                         color: "var(--text)",
                       }}
                     >
                       {f.name}
                     </span>
                     <span
                       style={{
                         fontSize: 11,
                         color: "var(--text-3)",
                         flexShrink: 0,
                       }}
                     >
                       {(f.size / 1024).toFixed(0)} KB
                     </span>
                     <button
                       onClick={() => removeFile(f.name)}
                       style={{
                         color: "var(--text-3)",
                         cursor: "pointer",
                         display: "flex",
                         padding: 2,
                         borderRadius: 4,
                         transition: "all 0.15s",
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.color = "var(--red)";
                         e.currentTarget.style.background = "var(--red-bg)";
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.color = "var(--text-3)";
                         e.currentTarget.style.background = "transparent";
                       }}
                     >
                       <X size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
          {/* Readiness card */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, var(--gold), transparent)",
                opacity: 0.4,
              }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Screening checklist
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {readyChecks.map(({ label, ok, value }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: ok ? "var(--green-bg)" : "var(--bg-4)",
                      border: `1px solid ${ok ? "var(--green-border)" : "var(--border-2)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {ok ? (
                      <CheckCircle size={10} color="var(--green)" />
                    ) : (
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "var(--text-3)",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: "var(--text-2)" }}>
                      {label}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: ok ? "var(--green)" : "var(--text-3)",
                      fontWeight: ok ? 500 : 400,
                      maxWidth: 90,
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 20px",
              background: loading
                ? "var(--bg-4)"
                : "linear-gradient(135deg, var(--gold), var(--gold-light))",
              color: loading ? "var(--text-2)" : "#0e0e0f",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              boxShadow: loading ? "none" : "0 4px 20px rgba(201,169,110,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(201,169,110,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = loading
                ? "none"
                : "0 4px 20px rgba(201,169,110,0.25)";
            }}
          >
            {loading ? (
              <>
                <Loader
                  size={15}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                {progress}
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Screen candidates
              </>
            )}
          </button>

          {loading && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--text-3)",
                lineHeight: 1.6,
              }}
            >
              This may take 10–30 seconds depending on the number of resumes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
