import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import BulkUploadPanel from "../components/BulkUploadPanel";

const API_BASE = "https://qpgs-backend.onrender.com";
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

const emptyForm = { questionText: "", subject: "", topic: "", difficultyLevel: "EASY", marks: "" };

export default function QuestionManagement({ token, onBack }) {
  const toast = useToast();
  
  // Pagination & Data States
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10; 

  // Search States (with Debouncing)
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setKeyword(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const loadQuestions = () => {
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/api/questions/paged?page=${page}&size=${size}&keyword=${keyword}`, authHeaders)
      .then((res) => {
        setQuestions(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      })
      .catch(() => {
        setError("Could not load questions.");
        toast.error("Could not load questions.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword]);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowBulkUpload(false);
    setShowForm(true);
  };

  const openBulkUpload = () => {
    setShowForm(false);
    setShowBulkUpload(true);
  };

  const openEditForm = (q) => {
    setForm({
      questionText: q.questionText,
      subject: q.subject,
      topic: q.topic,
      difficultyLevel: q.difficultyLevel,
      marks: q.marks,
    });
    setEditingId(q.id);
    setFormError("");
    setShowBulkUpload(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.questionText.trim() || !form.subject.trim() || !form.topic.trim() || !form.marks) {
      setFormError("Please fill in all fields.");
      return;
    }

    const payload = { ...form, marks: Number(form.marks) };
    setSaving(true);

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/questions/${editingId}`, payload, authHeaders);
        toast.success("Question updated successfully.");
      } else {
        await axios.post(`${API_BASE}/api/questions`, payload, authHeaders);
        toast.success("Question added successfully.");
      }
      closeForm();
      loadQuestions();
    } catch (err) {
      setFormError("Could not save question. Check the fields and try again.");
      toast.error("Could not save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_BASE}/api/questions/${id}`, authHeaders);
      toast.success("Question deleted.");
      if (questions.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        loadQuestions();
      }
    } catch (err) {
      setError("Could not delete question.");
      toast.error("Could not delete question.");
    }
  };

  const difficultyColor = (level) => {
    if (level === "EASY") return { bg: "#EAF3EA", text: "#2F6B3A", border: "#C3E2C3" };
    if (level === "MEDIUM") return { bg: "#FBF0DE", text: "#966A1F", border: "#EAD2A8" };
    return { bg: "#F8E7E2", text: "#B3441E", border: "#EAC3B8" };
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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
              Question Bank
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openBulkUpload}
            className="qpgs-sans text-sm font-medium px-4 py-2 rounded-md border transition-all hover:bg-gray-50"
            style={{ borderColor: "#D8D3C6", color: "#5B6478" }}
          >
            Bulk Upload
          </button>
          <button
            onClick={openAddForm}
            className="qpgs-sans text-sm font-medium px-4 py-2 rounded-md text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
          >
            + Add Question
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        
        {/* Search Bar */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9098A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by question text, subject, or topic..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="qpgs-sans w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-shadow shadow-sm focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white"
              style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
              onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
              onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
            />
          </div>
        </div>

        {error && (
          <p className="qpgs-sans text-sm mb-4 animate-fade-in-up" style={{ color: "#B3441E" }}>{error}</p>
        )}

        {showBulkUpload && (
          <div className="animate-fade-in-up mb-6">
            <BulkUploadPanel
              token={token}
              onDone={() => { setPage(0); loadQuestions(); }}
              onClose={() => setShowBulkUpload(false)}
            />
          </div>
        )}

        {/* Premium Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b" style={{ borderColor: "#E4DECD", backgroundColor: "#FDFCF9" }}>
                <h3 className="qpgs-serif text-xl" style={{ color: "#1B2A4A" }}>
                  {editingId ? "Edit Question" : "Add New Question"}
                </h3>
              </div>
              <form onSubmit={handleSave} className="p-6">
                <div className="mb-5">
                  <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>
                    Question Text
                  </label>
                  <textarea
                    value={form.questionText}
                    onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                    rows={3}
                    placeholder="Enter the complete question here..."
                    className="qpgs-sans w-full px-4 py-3 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white resize-none"
                    style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                    onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Physics"
                      className="qpgs-sans w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)]"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                    />
                  </div>
                  <div>
                    <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>Topic</label>
                    <input
                      type="text"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="e.g. Optics"
                      className="qpgs-sans w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)]"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                    />
                  </div>
                  <div>
                    <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>Difficulty</label>
                    <select
                      value={form.difficultyLevel}
                      onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                      className="qpgs-sans w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white cursor-pointer"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={form.marks}
                      onChange={(e) => setForm({ ...form, marks: e.target.value })}
                      placeholder="e.g. 5"
                      className="qpgs-sans w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)]"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                      onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                      onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                    />
                  </div>
                </div>

                {formError && (
                  <p className="qpgs-sans text-sm mb-4 p-3 rounded bg-red-50 border border-red-100" style={{ color: "#B3441E" }}>
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E4DECD" }}>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="qpgs-sans text-sm font-medium px-5 py-2.5 rounded-md transition-colors hover:bg-gray-100"
                    style={{ color: "#5B6478" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="qpgs-sans text-sm font-medium px-6 py-2.5 rounded-md text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
                  >
                    {saving ? "Saving..." : editingId ? "Update Question" : "Save Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E4DECD] border-t-[#B8863B] rounded-full animate-spin mb-3"></div>
              <p className="qpgs-sans text-sm" style={{ color: "#9098A8" }}>Loading your question bank...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center shadow-sm" style={{ borderColor: "#E4DECD" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FDFCF9", border: "1px solid #E4DECD" }}>
                <span className="text-2xl" style={{ color: "#B8863B" }}>?</span>
              </div>
              <h3 className="qpgs-serif text-xl mb-2" style={{ color: "#1B2A4A" }}>No questions found</h3>
              <p className="qpgs-sans text-sm max-w-md mx-auto" style={{ color: "#5B6478" }}>
                {keyword ? "We couldn't find anything matching your search. Try adjusting your keywords." : "Your question bank is empty. Start by adding a new question manually or use the bulk upload feature."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => {
                const colors = difficultyColor(q.difficultyLevel);
                return (
                  <div
                    key={q.id}
                    className="group bg-white rounded-xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    style={{ borderColor: "#E4DECD" }}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="qpgs-sans text-[15px] leading-relaxed mb-3" style={{ color: "#1B2A4A" }}>
                        {q.questionText}
                      </p>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="qpgs-sans text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wide border" style={{ backgroundColor: "#FDFCF9", color: "#5B6478", borderColor: "#E4DECD" }}>
                          {q.subject}
                        </span>
                        <span className="qpgs-sans text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wide border" style={{ backgroundColor: "#FDFCF9", color: "#5B6478", borderColor: "#E4DECD" }}>
                          {q.topic}
                        </span>
                        <span className="qpgs-sans text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border" style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
                          {q.difficultyLevel}
                        </span>
                        <span className="qpgs-sans text-xs ml-1 font-medium" style={{ color: "#9098A8" }}>
                          • &nbsp; {q.marks} Marks
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0" style={{ borderColor: "#E4DECD" }}>
                      <button
                        onClick={() => openEditForm(q)}
                        className="flex-1 md:flex-none qpgs-sans text-xs font-semibold px-4 py-2 rounded-md transition-colors bg-[#FDFCF9] hover:bg-[#F0EEE6] border"
                        style={{ borderColor: "#E4DECD", color: "#5B6478" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="flex-1 md:flex-none qpgs-sans text-xs font-semibold px-4 py-2 rounded-md transition-colors border hover:bg-red-50 hover:border-red-200"
                        style={{ borderColor: "#E4DECD", color: "#B3441E" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalElements > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <span className="qpgs-sans text-sm font-medium" style={{ color: "#5B6478" }}>
              Showing page {page + 1} of {totalPages} <span className="font-normal mx-1 text-[#D8D3C6]">|</span> {totalElements} items total
            </span>
            <div className="flex gap-2 shadow-sm rounded-md overflow-hidden border" style={{ borderColor: "#E4DECD" }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="qpgs-sans text-sm font-medium px-4 py-2 bg-white transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white border-r"
                style={{ color: "#1B2A4A", borderColor: "#E4DECD" }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="qpgs-sans text-sm font-medium px-4 py-2 bg-white transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                style={{ color: "#1B2A4A" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}