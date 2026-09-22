import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  // Trigger fade-in animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter a username and password.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        username,
        password,
        role,
      });
      alert("Registration Successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Registration failed. Username might already exist.");
      } else {
        setError("Couldn't reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: "#FAF8F3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;500;600&display=swap');
        .qpgs-serif { font-family: 'Source Serif 4', Georgia, serif; }
        .qpgs-sans { font-family: 'Inter', system-ui, sans-serif; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Left panel — brand identity */}
      <div
        className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12 transition-opacity duration-1000"
        style={{ 
          background: "linear-gradient(135deg, #1B2A4A 0%, #111A2E 100%)",
          opacity: mounted ? 1 : 0 
        }}
      >
        <div className="absolute inset-0 opacity-[0.07]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${i * 42 + 60}px`,
                left: "48px",
                right: "48px",
                height: "1px",
                backgroundColor: "#FFFFFF",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "88px",
              width: "1px",
              backgroundColor: "#B8863B",
              opacity: 0.6,
            }}
          />
        </div>

        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-10 shadow-lg"
            style={{ background: "linear-gradient(135deg, #B8863B 0%, #966A1F 100%)" }}
          >
            <span className="qpgs-serif text-xl text-white">Q</span>
          </div>
          <h1 className="qpgs-serif text-white text-4xl leading-tight max-w-sm">
            Join the platform.
          </h1>
          <p className="qpgs-sans text-sm mt-5 max-w-xs leading-relaxed" style={{ color: "#AEB8CC" }}>
            Create an account to manage question banks and generate randomized papers in seconds.
          </p>
        </div>

        <p className="qpgs-sans relative z-10 text-xs animate-fade-in-up" style={{ color: "#6B7896", animationDelay: "0.4s", opacity: 0 }}>
          Question Paper Generator System
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <div className="mb-8 md:hidden">
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4 shadow-md"
              style={{ background: "linear-gradient(135deg, #B8863B 0%, #966A1F 100%)" }}
            >
              <span className="qpgs-serif text-base text-white">Q</span>
            </div>
          </div>

          <h2 className="qpgs-serif text-3xl mb-1" style={{ color: "#1B2A4A" }}>
            Register
          </h2>
          <p className="qpgs-sans text-sm mb-8" style={{ color: "#5B6478" }}>
            Create a new admin or faculty account.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4 group">
              <label
                htmlFor="username"
                className="qpgs-sans block text-sm font-medium mb-1.5 transition-colors group-focus-within:text-[#B8863B]"
                style={{ color: "#1B2A4A" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="qpgs-sans w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white"
                style={{
                  borderColor: "#D8D3C6",
                  color: "#1B2A4A",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                placeholder="Choose a username"
              />
            </div>

            <div className="mb-4 group">
              <label
                htmlFor="role"
                className="qpgs-sans block text-sm font-medium mb-1.5 transition-colors group-focus-within:text-[#B8863B]"
                style={{ color: "#1B2A4A" }}
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="qpgs-sans w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white cursor-pointer"
                style={{
                  borderColor: "#D8D3C6",
                  color: "#1B2A4A",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="FACULTY">FACULTY</option>
              </select>
            </div>

            <div className="mb-2 group">
              <label
                htmlFor="password"
                className="qpgs-sans block text-sm font-medium mb-1.5 transition-colors group-focus-within:text-[#B8863B]"
                style={{ color: "#1B2A4A" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="qpgs-sans w-full px-3.5 py-2.5 pr-16 rounded-md border text-sm outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(184,134,59,0.15)] bg-white"
                  style={{
                    borderColor: "#D8D3C6",
                    color: "#1B2A4A",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#B8863B")}
                  onBlur={(e) => (e.target.style.borderColor = "#D8D3C6")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="qpgs-sans absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#B8863B" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="qpgs-sans text-sm mt-3 animate-fade-in-up" style={{ color: "#B3441E" }} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="qpgs-sans w-full mt-6 py-3 rounded-md text-sm font-medium text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="qpgs-sans text-sm mt-8 text-center" style={{ color: "#5B6478" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium hover:underline transition-colors"
              style={{ color: "#B8863B" }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}