import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_BASE = "http://localhost:8080";

export default function ManageUsers({ token, currentUsername, onBack }) {
  const toast = useToast();
  
  // Pagination & Data States
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10; // Number of users per page

  // Search States
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  // Debounce search input (wait 500ms after typing stops)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setKeyword(searchInput);
      setPage(0); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const loadUsers = () => {
    setLoading(true);
    setError("");
    axios
      .get(`${API_BASE}/api/admin/users/paged?page=${page}&size=${size}&keyword=${keyword}`, authHeaders)
      .then((res) => {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      })
      .catch((err) => {
        if (err.response && err.response.status === 403) {
          setError("Only admins can view this page.");
        } else {
          setError("Could not load users.");
          toast.error("Could not load users.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword]);

  const handleRoleChange = async (id, newRole) => {
    setSavingId(id);
    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/users/${id}/role`,
        { role: newRole },
        authHeaders
      );
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      toast.success(`Role updated to ${newRole}.`);
    } catch (err) {
      setError("Could not update role.");
      toast.error("Could not update role.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id, username) => {
    if (username === currentUsername) {
      setError("You cannot delete your own account.");
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/users/${id}`, authHeaders);
      toast.success(`User "${username}" deleted.`);
      // Move back one page if the last item on the current page is deleted
      if (users.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        loadUsers();
      }
    } catch (err) {
      setError("Could not delete user.");
      toast.error("Could not delete user.");
    }
  };

  const roleColor = (role) =>
    role === "ADMIN" ? { bg: "#EAF0FB", text: "#1B2A4A" } : { bg: "#FBF0DE", text: "#966A1F" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600&display=swap');
        .qpgs-serif { font-family: 'Source Serif 4', Georgia, serif; }
        .qpgs-sans { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Top bar */}
      <header
        className="flex items-center gap-4 px-6 md:px-10 py-4 border-b"
        style={{ borderColor: "#E4DECD", backgroundColor: "#FFFFFF" }}
      >
        <button onClick={onBack} className="qpgs-sans text-sm font-medium" style={{ color: "#5B6478" }}>
          ← Dashboard
        </button>
        <span className="qpgs-serif text-lg" style={{ color: "#1B2A4A" }}>
          Manage Users
        </span>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-3xl mx-auto">
        {/* Smart Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by username or role..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="qpgs-sans px-3.5 py-2 rounded-md border text-sm outline-none w-full"
            style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
          />
        </div>

        {error && (
          <p className="qpgs-sans text-sm mb-4" style={{ color: "#B3441E" }}>{error}</p>
        )}

        {/* Users list */}
        {loading ? (
          <p className="qpgs-sans text-sm" style={{ color: "#9098A8" }}>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: "#E4DECD" }}>
            <p className="qpgs-sans text-sm" style={{ color: "#9098A8" }}>
              {keyword ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "#E4DECD" }}>
            {users.map((u, i) => {
              const colors = roleColor(u.role);
              const isSelf = u.username === currentUsername;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 p-4"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #E4DECD" }}
                >
                  <div className="min-w-0">
                    <p className="qpgs-sans text-sm font-medium" style={{ color: "#1B2A4A" }}>
                      {u.username} {isSelf && <span style={{ color: "#9098A8" }}>(you)</span>}
                    </p>
                    <span
                      className="qpgs-sans text-xs px-2 py-0.5 rounded font-medium inline-block mt-1"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={u.role}
                      disabled={isSelf || savingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="qpgs-sans text-xs px-2.5 py-1.5 rounded-md border outline-none disabled:opacity-50"
                      style={{ borderColor: "#D8D3C6", color: "#1B2A4A" }}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="FACULTY">FACULTY</option>
                    </select>
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={isSelf}
                      className="qpgs-sans text-xs font-medium px-3 py-1.5 rounded-md border disabled:opacity-40"
                      style={{ borderColor: "#F0D5CB", color: "#B3441E" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalElements > 0 && (
          <div className="flex items-center justify-between mt-6">
            <span className="qpgs-sans text-sm" style={{ color: "#5B6478" }}>
              Showing page {page + 1} of {totalPages} ({totalElements} total items)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="qpgs-sans text-sm font-medium px-4 py-2 rounded-md border disabled:opacity-50"
                style={{ borderColor: "#D8D3C6", color: "#1B2A4A", backgroundColor: "#FFF" }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="qpgs-sans text-sm font-medium px-4 py-2 rounded-md border disabled:opacity-50"
                style={{ borderColor: "#D8D3C6", color: "#1B2A4A", backgroundColor: "#FFF" }}
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