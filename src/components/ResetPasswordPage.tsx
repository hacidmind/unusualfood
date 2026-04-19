import { useState } from "react";
import { api } from "../services/api";

interface Props {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ResetPasswordPage({ isDark, onToggleTheme }: Props) {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError(""); setMessage("");
    if (!token) return setError("Missing reset token.");
    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await api.resetPassword(token, newPassword);
      if (res.error) setError(res.error);
      else {
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
    <div className="app-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {isDark ? "☀️" : "🌙"}
          <span style={{ fontSize: 13 }}>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h2 className="brand-text" style={{ fontSize: 24, margin: 0 }}>Reset Password</h2>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 6 }}>Enter a new password for your account.</p>
        </div>

        <div className="card" style={{ padding: "28px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>New Password</label>
              <input className="theme-input" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Confirm Password</label>
              <input className="theme-input" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>

            {error && (
              <p style={{ color: "var(--red)", fontSize: 13, margin: 0, padding: "10px 12px", background: "rgba(239,68,68,0.07)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ color: "var(--green)", fontSize: 13, margin: 0, padding: "10px 12px", background: "rgba(22,163,74,0.07)", borderRadius: 8, border: "1px solid rgba(22,163,74,0.2)" }}>
                ✅ {message}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button disabled={loading} onClick={handleReset} className="btn-green"
                style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 14 }}>
                {loading ? "Working…" : "Reset Password"}
              </button>
              <a href="/" className="btn-ghost"
                style={{ flex: 1, padding: 12, borderRadius: 10, textDecoration: "none", fontSize: 14, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Cancel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
