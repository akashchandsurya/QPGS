import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_BASE = "http://localhost:8080";
const emptyForm = { name: "", description: "" };

export default function SubjectManagement({ token, onBack }) {
  const toast = useToast();
  
  // Pagination & Data States
  const [subjects, setSubjects] = useState([]);
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

  const loadSubjects = () => {
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/api/subjects/paged?page=${page}&size=${size}&keyword=${keyword}`, authHeaders)
      .then((res) => {
        setSubjects(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      })
      .catch(() => {
        setError("Could not load subjects.");
        toast.error("Could not load subjects.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword]);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setForm({ name: s.name, description: s.description || "" });
    setEditingId(s.id);
    setFormError("");
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

    if (!form.name.trim()) {
      setFormError("Subject name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/subjects/${editingId}`, form, authHeaders);
        toast.success("Subject updated successfully.");
      } else {
        await axios.post(`${API_BASE}/api/subjects`, form, authHeaders);
        toast.success("Subject added successfully.");
      }
      closeForm();
      loadSubjects();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setFormError("A subject with this name already exists.");
        toast.error("Subject name already exists.");
      } else {
        setFormError("Could not save subject. Please try again.");
        toast.error("Could not save subject.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_BASE}/api/subjects/${id}`, authHeaders);
      toast.success("Subject deleted.");
      if (subjects.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        loadSubjects();
      }
    } catch (err) {
      setError("Could not delete subject.");
      toast.error("Could not delete subject.");
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
              <span className="qpgs-serif text-xs text-white">S</span>
            </div>
            <span className="qpgs-serif text-lg" style={{ color: "#1B2A4A" }}>
              Subjects
            </span>
          </div>
        </div>
        <button
          onClick={openAddForm}
          className="qpgs-sans text-sm font-medium px-4 py-2 rounded-md text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
        >
          + Add Subject
        </button>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-4xl mx-auto">
        
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
              placeholder="Search subjects by name or description..."
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

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b" style={{ borderColor: "#E4DECD", backgroundColor: "#FDFCF9" }}>
                <h3 className="qpgs-serif text-xl" style={{ color: "#1B2A4A" }}>
                  {editingId ? "Edit Subject" : "Add New Subject"}
                </h3>
              </div>
              <form onSubmit={handleSave} className="p-6">
                <div className="mb-4">
                  <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="qpgs-sans w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)]"
                    style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                    placeholder="e.g. Mathematics"
                    onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                  />
                </div>
                <div className="mb-6">
                  <label className="qpgs-sans block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#5B6478" }}>
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="qpgs-sans w-full px-4 py-3 rounded-md border text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] resize-none"
                    style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                    placeholder="Optional short description about the subject..."
                    onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                    onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                  />
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
                    {saving ? "Saving..." : editingId ? "Update Subject" : "Save Subject"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subjects list */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E4DECD] border-t-[#B8863B] rounded-full animate-spin mb-3"></div>
              <p className="qpgs-sans text-sm" style={{ color: "#9098A8" }}>Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center shadow-sm" style={{ borderColor: "#E4DECD" }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FDFCF9", border: "1px solid #E4DECD" }}>
                <span className="text-2xl" style={{ color: "#B8863B" }}>📚</span>
              </div>
              <h3 className="qpgs-serif text-xl mb-2" style={{ color: "#1B2A4A" }}>No subjects found</h3>
              <p className="qpgs-sans text-sm max-w-md mx-auto" style={{ color: "#5B6478" }}>
                {keyword ? "We couldn't find anything matching your search. Try adjusting your keywords." : "Your subjects list is empty. Start by adding a new subject."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="group bg-white rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: "#E4DECD" }}
                >
                  <div className="mb-4">
                    <h3 className="qpgs-serif text-lg font-semibold mb-1.5" style={{ color: "#1B2A4A" }}>
                      {s.name}
                    </h3>
                    {s.description ? (
                      <p className="qpgs-sans text-sm leading-relaxed line-clamp-2" style={{ color: "#5B6478" }}>
                        {s.description}
                      </p>
                    ) : (
                      <p className="qpgs-sans text-sm italic" style={{ color: "#9098A8" }}>
                        No description provided.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "#E4DECD" }}>
                    <button
                      onClick={() => openEditForm(s)}
                      className="flex-1 qpgs-sans text-xs font-semibold px-4 py-2 rounded-md transition-colors bg-[#FDFCF9] hover:bg-[#F0EEE6] border"
                      style={{ borderColor: "#E4DECD", color: "#5B6478" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="flex-1 qpgs-sans text-xs font-semibold px-4 py-2 rounded-md transition-colors border hover:bg-red-50 hover:border-red-200"
                      style={{ borderColor: "#E4DECD", color: "#B3441E" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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