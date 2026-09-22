import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_BASE = "http://localhost:8080";

export default function PaperGeneration({ token, username, onBack }) {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject: "", easyCount: 0, mediumCount: 0, hardCount: 0 });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [paper, setPaper] = useState(null);
  const [exporting, setExporting] = useState("");
  const [deleting, setDeleting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/subjects`, authHeaders)
      .then((res) => setSubjects(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount =
    Number(form.easyCount || 0) + Number(form.mediumCount || 0) + Number(form.hardCount || 0);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setPaper(null);

    if (!form.subject.trim()) {
      setError("Please select or enter a subject.");
      return;
    }
    if (totalCount === 0) {
      setError("Enter at least one question count (easy, medium, or hard).");
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/papers/generate`,
        {
          subject: form.subject,
          generatedBy: username || "unknown",
          easyCount: Number(form.easyCount || 0),
          mediumCount: Number(form.mediumCount || 0),
          hardCount: Number(form.hardCount || 0),
        },
        authHeaders
      );
      setPaper(res.data);
      toast.success("Paper generated successfully.");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        toast.error(err.response.data.error);
      } else {
        setError("Could not generate paper. Please try again.");
        toast.error("Could not generate paper.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (type) => {
    if (!paper) return;
    setExporting(type);
    try {
      const res = await axios.get(`${API_BASE}/api/papers/${paper.id}/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const ext = type === "pdf" ? "pdf" : "docx";
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `question-paper-${paper.id}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${type === "pdf" ? "PDF" : "Word"} downloaded.`);
    } catch (err) {
      setError(`Could not export ${type.toUpperCase()}.`);
      toast.error(`Could not export ${type.toUpperCase()}.`);
    } finally {
      setExporting("");
    }
  };

  const handleDeletePaper = async () => {
    if (!paper) return;
    if (!window.confirm("Delete this generated paper? This cannot be undone.")) return;

    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/papers/${paper.id}`, authHeaders);
      toast.success("Paper deleted.");
      setPaper(null);
    } catch (err) {
      toast.error("Could not delete paper.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600&display=swap');
        .qpgs-serif { font-family: 'Source Serif 4', Georgia, serif; }
        .qpgs-sans { font-family: 'Inter', system-ui, sans-serif; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>

      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 md:px-10 py-4 border-b bg-white relative z-20 shadow-sm"
        style={{ borderColor: "#E4DECD" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Back to Dashboard"
          >
            <span style={{ color: "#5B6478" }}>←</span>
          </button>
          <div className="flex items-center gap-3 border-l pl-4" style={{ borderColor: "#E4DECD" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #B8863B 0%, #966A1F 100%)" }}
            >
              <span className="qpgs-serif text-xs text-white">Q</span>
            </div>
            <span className="qpgs-serif text-lg" style={{ color: "#1B2A4A" }}>
              Generate Paper
            </span>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
        
        {/* Criteria form */}
        <div className="bg-white rounded-xl border p-8 mb-8 shadow-sm animate-fade-in-up" style={{ borderColor: "#E4DECD", animationDelay: "0.1s" }}>
          <div className="mb-6">
            <h2 className="qpgs-serif text-2xl mb-1" style={{ color: "#1B2A4A" }}>
              Paper Configuration
            </h2>
            <p className="qpgs-sans text-sm" style={{ color: "#5B6478" }}>
              Select your subject and set the exact number of questions based on difficulty.
            </p>
          </div>
          
          <form onSubmit={handleGenerate}>
            <div className="mb-6">
              <label className="qpgs-sans block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#5B6478" }}>
                Subject
              </label>
              {subjects.length > 0 ? (
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="qpgs-sans w-full px-4 py-3 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white cursor-pointer"
                  style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                  onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                  onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                >
                  <option value="">-- Select a subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="qpgs-sans w-full px-4 py-3 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white"
                  style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                  onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                  onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                />
              )}
            </div>

            <label className="qpgs-sans block text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "#5B6478" }}>
              Question Distribution
            </label>
            <div className="grid grid-cols-3 gap-4 mb-3">
              {[
                { key: "easyCount", label: "Easy", color: "#2F6B3A", bg: "#EAF3EA", border: "#C3E2C3" },
                { key: "mediumCount", label: "Medium", color: "#966A1F", bg: "#FBF0DE", border: "#EAD2A8" },
                { key: "hardCount", label: "Hard", color: "#B3441E", bg: "#F8E7E2", border: "#EAC3B8" },
              ].map((f) => (
                <div key={f.key} className="relative">
                  <div 
                    className="absolute top-0 left-0 w-full h-1 rounded-t-md" 
                    style={{ backgroundColor: f.color }}
                  ></div>
                  <div className="pt-4 pb-3 px-3 border rounded-md bg-[#FDFCF9] text-center" style={{ borderColor: "#E4DECD" }}>
                    <label className="qpgs-sans block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: f.color }}>
                      {f.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="qpgs-sans w-full text-center text-lg font-semibold bg-transparent border-b outline-none transition-colors"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                      onFocus={(e) => (e.target.style.borderColor = f.color)}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t" style={{ borderColor: "#E4DECD" }}>
              <p className="qpgs-sans text-sm font-medium" style={{ color: "#5B6478" }}>
                Total Questions: <span className="text-lg text-[#1B2A4A] ml-1">{totalCount}</span>
              </p>

              <button
                type="submit"
                disabled={generating || totalCount === 0}
                className="qpgs-sans text-sm font-medium px-6 py-3 rounded-md text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : "Generate Paper"}
              </button>
            </div>
            
            {error && (
              <p className="qpgs-sans text-sm mt-4 p-3 rounded bg-red-50 border border-red-100 animate-fade-in-up" style={{ color: "#B3441E" }}>
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Result Preview */}
        {paper && (
          <div className="bg-white rounded-xl border shadow-lg overflow-hidden animate-fade-in-up" style={{ borderColor: "#E4DECD", animationDelay: "0.2s" }}>
            <div className="p-6 md:p-8 bg-[#FDFCF9] border-b" style={{ borderColor: "#E4DECD" }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs">✓</span>
                    <span className="qpgs-sans text-xs font-bold uppercase tracking-wide text-green-700">Success</span>
                  </div>
                  <h2 className="qpgs-serif text-2xl" style={{ color: "#1B2A4A" }}>
                    {paper.subject} Examination
                  </h2>
                  <p className="qpgs-sans text-sm mt-1" style={{ color: "#5B6478" }}>
                    {paper.totalQuestions} Questions &nbsp;•&nbsp; {paper.totalMarks} Total Marks &nbsp;•&nbsp; ID: #{paper.id}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={exporting !== ""}
                    className="qpgs-sans text-xs font-semibold px-4 py-2 rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-60"
                    style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                  >
                    {exporting === "pdf" ? "Exporting..." : "Download PDF"}
                  </button>
                  <button
                    onClick={() => handleExport("word")}
                    disabled={exporting !== ""}
                    className="qpgs-sans text-xs font-semibold px-4 py-2 rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-60"
                    style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                  >
                    {exporting === "word" ? "Exporting..." : "Download Word"}
                  </button>
                  <button
                    onClick={handleDeletePaper}
                    disabled={deleting}
                    className="qpgs-sans text-xs font-semibold px-4 py-2 rounded-md border transition-colors hover:bg-red-50 hover:border-red-200 disabled:opacity-60"
                    style={{ borderColor: "#F0D5CB", color: "#B3441E" }}
                  >
                    {deleting ? "Deleting..." : "Discard"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="qpgs-sans text-xs font-bold uppercase tracking-widest mb-6 border-b pb-2" style={{ color: "#9098A8", borderColor: "#E4DECD" }}>
                Document Preview
              </h3>
              <div className="space-y-6">
                {paper.questions.map((q, i) => (
                  <div key={q.id} className="flex gap-4 group">
                    <span className="qpgs-serif text-lg shrink-0" style={{ color: "#9098A8" }}>
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="qpgs-sans text-[15px] leading-relaxed mb-2" style={{ color: "#1B2A4A" }}>
                        {q.questionText}
                      </p>
                      <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="qpgs-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border" 
                          style={{ 
                            color: q.difficultyLevel === "EASY" ? "#2F6B3A" : q.difficultyLevel === "MEDIUM" ? "#966A1F" : "#B3441E",
                            borderColor: q.difficultyLevel === "EASY" ? "#C3E2C3" : q.difficultyLevel === "MEDIUM" ? "#EAD2A8" : "#EAC3B8",
                            backgroundColor: q.difficultyLevel === "EASY" ? "#EAF3EA" : q.difficultyLevel === "MEDIUM" ? "#FBF0DE" : "#F8E7E2"
                          }}>
                          {q.difficultyLevel}
                        </span>
                        <span className="qpgs-sans text-xs" style={{ color: "#9098A8" }}>
                          [{q.marks} marks]
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}