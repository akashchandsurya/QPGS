import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import Register from "./pages/Register"; // <-- ADDED REGISTER IMPORT
import Dashboard from "./pages/Dashboard";
import QuestionManagement from "./pages/QuestionManagement";
import SubjectManagement from "./pages/SubjectManagement";
import PaperGeneration from "./pages/PaperGeneration";
import ManageUsers from "./pages/ManageUsers";

const API_BASE = "http://localhost:8080";
// Access token lasts 1 hour on the backend - refresh a bit before it expires.
const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

function AppRoutes() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const navigate = useNavigate();

  const handleLoginSuccess = (newToken, newRole, newUsername, newRefreshToken) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    if (newUsername) localStorage.setItem("username", newUsername);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await axios.post(`${API_BASE}/api/auth/logout`, { refreshToken });
      } catch (err) {
        // best effort - proceed with local logout even if this fails
      }
    }
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
    navigate("/login");
  };

  // Silent background refresh
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return;

      try {
        const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } catch (err) {
        // refresh token expired/invalid - force logout
        handleLogout();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Routes>
      {/* ADDED REGISTER ROUTE HERE */}
      <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} />

      <Route
        path="/dashboard"
        element={
          token ? (
            <Dashboard
              role={role}
              username={username}
              token={token}
              onNavigate={navigate}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/questions"
        element={
          token ? (
            <QuestionManagement token={token} onBack={() => navigate("/dashboard")} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/subjects"
        element={
          token ? (
            <SubjectManagement token={token} onBack={() => navigate("/dashboard")} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/generate"
        element={
          token ? (
            <PaperGeneration token={token} username={username} onBack={() => navigate("/dashboard")} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/admin/users"
        element={
          token ? (
            <ManageUsers token={token} currentUsername={username} onBack={() => navigate("/dashboard")} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}