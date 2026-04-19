import { useState } from "react";
import { api } from "../services/api";

const APP_BG: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f0d0a 0%, #1e1005 50%, #080f06 100%)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(249,115,22,0.25)",
  background: "rgba(10,6,2,0.7)",
  color: "white",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");
    setMessage("");
    if (!token) return setError("Missing reset token.");
    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await api.resetPassword(token, newPassword);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage(res.message || "Password reset successfully.");
        setTimeout(() => { window.location.href = "/"; }, 2000);
      }
    } catch {
      setError("Failed to contact server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={APP_BG}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div
          className="glass"
          style={{ borderRadius: 20, padding: "36px 32px", boxShadow: "0 8px 40px rgba(249,115,22,0.15), 0 2px 8px rgba(0,0,0,0.6)" }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
            <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Reset Password</h2>
            <p style={{ color: "#a8906a", fontSize: 14, marginTop: 6 }}>
              Enter a new password for your account.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
            />

            {error && (
              <p style={{ color: "#f87171", fontSize: 13, margin: 0, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ color: "#34d399", fontSize: 13, margin: 0, padding: "8px 12px", background: "rgba(52,211,153,0.1)", borderRadius: 8, border: "1px solid rgba(52,211,153,0.3)" }}>
                ✅ {message}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                disabled={loading}
                onClick={handleReset}
                className="btn-primary"
                style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14 }}
              >
                {loading ? "Working..." : "Reset Password"}
              </button>
              <a
                href="/"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "12px 18px", borderRadius: 10, textDecoration: "none",
                  fontSize: 14, fontWeight: 600, color: "#c4a882",
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(249,115,22,0.2)"
                }}
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
