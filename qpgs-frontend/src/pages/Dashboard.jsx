import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const API_BASE = "http://localhost:8080";
const DIFFICULTY_COLORS = { EASY: "#2F6B3A", MEDIUM: "#B8863B", HARD: "#B3441E" };
const SUBJECT_BAR_COLOR = "#1B2A4A";

// Premium Count-Up Animation Component
const CountUpNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value == null) return;
    let start = 0;
    const duration = 1200; // 1.2 seconds animation
    const increment = value / (duration / 16); 
    
    const handle = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(handle);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(handle);
  }, [value]);

  return <span>{value == null ? "—" : count}</span>;
};

export default function Dashboard({ role = "ADMIN", username = "admin1", token, onNavigate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (role !== "ADMIN") return;

    axios
      .get(`${API_BASE}/api/admin/dashboard/stats`, authHeaders)
      .then((res) => setStats(res.data))
      .catch(() => setStatsError("Could not load stats."));

    axios
      .get(`${API_BASE}/api/admin/dashboard/analytics`, authHeaders)
      .then((res) => setAnalytics(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, token]);

  const navigate = (path) => {
    if (onNavigate) onNavigate(path);
  };

  const statCards = [
    { label: "Total Questions", value: stats?.totalQuestions },
    { label: "Total Subjects", value: stats?.totalSubjects },
    { label: "Papers Generated", value: stats?.totalPapersGenerated },
    { label: "Total Users", value: stats?.totalUsers },
  ];

  const actionCards = [
    {
      title: "Question Bank",
      desc: "Add, edit, and organize questions by subject and difficulty.",
      path: "/questions",
    },
    {
      title: "Subjects",
      desc: "Manage the subject list questions are grouped under.",
      path: "/subjects",
    },
    {
      title: "Generate Paper",
      desc: "Set criteria and generate a randomized question paper.",
      path: "/generate",
    },
  ];

  if (role === "ADMIN") {
    actionCards.push({
      title: "Manage Users",
      desc: "Review faculty/admin accounts and update roles.",
      path: "/admin/users",
    });
  }

  const subjectChartData = analytics
    ? Object.entries(analytics.questionsBySubject).map(([name, value]) => ({ name, value }))
    : [];

  const difficultyChartData = analytics
    ? Object.entries(analytics.questionsByDifficulty).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F3" }}>
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
          opacity: 0;
        }
      `}</style>

      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 md:px-10 py-4 border-b bg-white relative z-20 shadow-sm"
        style={{ borderColor: "#E4DECD" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #B8863B 0%, #966A1F 100%)" }}
          >
            <span className="qpgs-serif text-sm text-white">Q</span>
          </div>
          <span className="qpgs-serif text-lg" style={{ color: "#1B2A4A" }}>
            Question Paper Generator
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="qpgs-sans text-sm font-medium" style={{ color: "#1B2A4A" }}>
              {username}
            </p>
            <p className="qpgs-sans text-xs" style={{ color: "#9098A8" }}>
              {role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="qpgs-sans text-sm font-medium px-3.5 py-1.5 rounded-md border transition-all duration-300 hover:bg-gray-50 hover:shadow-sm"
            style={{ borderColor: "#D8D3C6", color: "#5B6478" }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="qpgs-serif text-3xl mb-1" style={{ color: "#1B2A4A" }}>
            Welcome back{username ? `, ${username}` : ""}
          </h1>
          <p className="qpgs-sans text-sm mb-8" style={{ color: "#5B6478" }}>
            {role === "ADMIN"
              ? "Here's an overview of your question bank and activity."
              : "Ready to put together your next question paper."}
          </p>
        </div>

        {/* Stats row - admin only */}
        {role === "ADMIN" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: "#E4DECD", borderTop: "3px solid #1B2A4A" }}
              >
                <p className="qpgs-serif text-3xl font-semibold" style={{ color: "#1B2A4A" }}>
                  <CountUpNumber value={s.value} />
                </p>
                <p className="qpgs-sans text-xs mt-1.5 font-medium tracking-wide uppercase" style={{ color: "#9098A8" }}>
                  {s.label}
                </p>
              </div>
            ))}
            {statsError && (
              <p className="qpgs-sans text-xs col-span-full" style={{ color: "#B3441E" }}>
                {statsError}
              </p>
            )}
          </div>
        )}

        {/* Analytics charts - admin only, shown when there's data */}
        {role === "ADMIN" && analytics && (subjectChartData.length > 0 || difficultyChartData.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {subjectChartData.length > 0 && (
              <div className="bg-white rounded-xl border p-6 transition-all duration-300 hover:shadow-md" style={{ borderColor: "#E4DECD" }}>
                <h3 className="qpgs-serif text-lg mb-4" style={{ color: "#1B2A4A" }}>
                  Questions by Subject
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4DECD" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5B6478" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#5B6478" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#F8F6F0" }} contentStyle={{ borderRadius: "8px", border: "1px solid #E4DECD" }} />
                    <Bar dataKey="value" fill={SUBJECT_BAR_COLOR} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {difficultyChartData.length > 0 && (
              <div className="bg-white rounded-xl border p-6 transition-all duration-300 hover:shadow-md" style={{ borderColor: "#E4DECD" }}>
                <h3 className="qpgs-serif text-lg mb-4" style={{ color: "#1B2A4A" }}>
                  Questions by Difficulty
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={difficultyChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      label={(entry) => entry.name}
                      stroke="none"
                    >
                      {difficultyChartData.map((entry, index) => (
                        <Cell key={index} fill={DIFFICULTY_COLORS[entry.name] || "#9098A8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E4DECD" }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="qpgs-serif text-xl mb-4" style={{ color: "#1B2A4A" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionCards.map((card) => (
              <button
                key={card.title}
                onClick={() => navigate(card.path)}
                className="group text-left bg-white rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B8863B] focus:ring-offset-2"
                style={{ borderColor: "#E4DECD" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="qpgs-serif text-xl transition-colors group-hover:text-[#B8863B]" style={{ color: "#1B2A4A" }}>
                    {card.title}
                  </p>
                  <span className="text-[#B8863B] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="qpgs-sans text-sm leading-relaxed" style={{ color: "#5B6478" }}>
                  {card.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}