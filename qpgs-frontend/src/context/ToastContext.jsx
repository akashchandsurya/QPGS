import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const value = {
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration),
    info: (msg, duration) => push(msg, "info", duration),
  };

  const styles = {
    success: { 
      icon: "✓", 
      iconBg: "#2F6B3A", 
      border: "#C3E2C3", 
      titleColor: "#2F6B3A" 
    },
    error: { 
      icon: "✕", 
      iconBg: "#B3441E", 
      border: "#EAC3B8", 
      titleColor: "#B3441E" 
    },
    info: { 
      icon: "i", 
      iconBg: "#1B2A4A", 
      border: "#C3D4E2", 
      titleColor: "#1B2A4A" 
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-toast-in {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        style={{ width: "100%", maxWidth: "340px" }}
      >
        {toasts.map((t) => {
          const s = styles[t.type] || styles.info;
          return (
            <div
              key={t.id}
              onClick={() => remove(t.id)}
              className="animate-toast-in pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white border shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-x-1"
              style={{
                borderColor: s.border,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <div 
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                style={{ backgroundColor: s.iconBg, boxShadow: `0 2px 8px ${s.border}` }}
              >
                {s.icon}
              </div>
              <div className="flex-1 pr-2">
                <p className="text-sm font-bold uppercase tracking-wider mb-0.5" style={{ color: s.titleColor }}>
                  {t.type}
                </p>
                <p className="text-[13px] font-medium leading-relaxed" style={{ color: "#5B6478" }}>
                  {t.message}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); remove(t.id); }}
                className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity p-1 mt-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }
  return ctx;
}