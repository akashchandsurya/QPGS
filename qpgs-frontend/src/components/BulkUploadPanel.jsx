import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_BASE = "https://qpgs-backend.onrender.com";

export default function BulkUploadPanel({ token, onDone, onClose }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/questions/bulk-upload/template`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "questions-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download template.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/api/questions/bulk-upload`, formData, authHeaders);
      setResult(res.data);

      if (res.data.successCount > 0) {
        toast.success(`${res.data.successCount} question(s) added.`);
        if (onDone) onDone();
      }
      if (res.data.failCount > 0) {
        toast.error(`${res.data.failCount} row(s) failed. See details below.`);
      }
    } catch (err) {
      toast.error("Upload failed. Check the file and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 relative overflow-hidden" style={{ borderColor: "#E4DECD" }}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #B8863B 100%)" }}></div>
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="qpgs-serif text-xl mb-1" style={{ color: "#1B2A4A" }}>
            Bulk Upload Questions
          </h3>
          <p className="qpgs-sans text-sm" style={{ color: "#5B6478" }}>
            Upload an <strong className="font-semibold text-[#1B2A4A]">.xlsx</strong> file to add multiple questions at once.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: "#9098A8" }}
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-5 rounded-lg border border-dashed mb-6 bg-[#FDFCF9]" style={{ borderColor: "#D8D3C6" }}>
        <div className="flex-1 w-full">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="qpgs-sans block w-full text-sm text-[#5B6478]
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-md file:border file:border-[#E4DECD]
              file:text-xs file:font-semibold file:uppercase file:tracking-wider
              file:bg-white file:text-[#1B2A4A]
              hover:file:bg-[#F0EEE6] file:transition-colors file:cursor-pointer"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#E4DECD]">
          <button
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="qpgs-sans text-xs font-semibold px-4 py-2.5 rounded-md border transition-colors hover:bg-white disabled:opacity-60 bg-[#FDFCF9]"
            style={{ borderColor: "#D8D3C6", color: "#5B6478" }}
          >
            {downloading ? "Downloading..." : "Get Template"}
          </button>
          
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="qpgs-sans text-xs font-semibold px-6 py-2.5 rounded-md text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-md"
            style={{ background: "linear-gradient(90deg, #1B2A4A 0%, #2A4073 100%)" }}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : "Upload File"}
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-fade-in-up">
          <div className="rounded-lg p-4 border" style={{ 
            backgroundColor: result.failCount > 0 ? "#FFF5F5" : "#F0FDF4",
            borderColor: result.failCount > 0 ? "#FEE2E2" : "#DCFCE7"
          }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{result.failCount > 0 ? "⚠️" : "✅"}</span>
              <p className="qpgs-sans text-sm font-semibold" style={{ color: result.failCount > 0 ? "#B3441E" : "#166534" }}>
                {result.successCount} questions added successfully
              </p>
            </div>
            
            {result.failCount > 0 && (
              <p className="qpgs-sans text-sm mt-1 font-medium" style={{ color: "#B3441E" }}>
                {result.failCount} rows failed to upload:
              </p>
            )}
            
            {result.errors && result.errors.length > 0 && (
              <ul className="qpgs-sans text-xs mt-3 space-y-1.5 p-3 bg-white rounded border border-red-100 max-h-40 overflow-y-auto" style={{ color: "#B3441E" }}>
                {result.errors.map((err, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="opacity-60">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}