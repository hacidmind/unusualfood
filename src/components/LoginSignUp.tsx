import { useState } from "react";
import { api, auth } from "../services/api";

type AuthScreen = "login" | "register";

interface Props {
  onAuthenticated: (fullName: string) => void;
}

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
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(249,115,22,0.25)",
  background: "rgba(10,6,2,0.7)",
  padding: "13px 14px",
  color: "white",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

export function LoginSignUp({ onAuthenticated }: Props) {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result =
        screen === "login"
          ? await api.login(email, password)
          : await api.register(email, password, fullName);

      if (result.error) {
        setError(result.error);
      } else if (result.token) {
        auth.setToken(result.token);
        onAuthenticated(result.user?.fullName || fullName || "User");
      } else {
        setError("No token received from server.");
      }
    } catch {
      setError("Cannot reach server. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError("");
    try {
      const result = await api.forgotPassword(forgotEmail);
      if (result.error) setForgotError(result.error);
      else setForgotMessage(result.message || "If an account exists, instructions were sent.");
    } catch {
      setForgotError("Failed to contact server.");
    }
  };

  return (
    <div style={APP_BG}>
      {/* Decorative background text */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {["🍲", "🌶️", "🍛", "🥘", "🫕", "🍖"].map((emoji, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              fontSize: 120,
              opacity: 0.03,
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 100}%`,
              transform: `rotate(${i * 15}deg)`,
              userSelect: "none",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        {/* Card */}
        <div
          className="glass"
          style={{
            borderRadius: 20,
            padding: "36px 32px",
            boxShadow: "0 8px 40px rgba(249,115,22,0.15), 0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍽️</div>
            <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              Chop Planner
            </h1>
            <p style={{ color: "#a8906a", fontSize: 14, marginTop: 6 }}>
              Your weekly Lagos meal plan
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(["login", "register"] as AuthScreen[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setScreen(s); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  ...(screen === s
                    ? { background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "white" }
                    : { background: "transparent", color: "#a8906a" }),
                }}
              >
                {s === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {screen === "register" && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            {screen === "login" && (
              <div style={{ textAlign: "right", marginTop: -6 }}>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotMessage(""); setForgotError(""); }}
                  style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontSize: 13 }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p style={{ color: "#f87171", fontSize: 13, margin: 0, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ borderRadius: 10, padding: "13px 0", fontSize: 15, marginTop: 4 }}
            >
              {loading ? "Loading..." : screen === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#6b5a42", fontSize: 13, marginTop: 20 }}>
          Eat well. Live well. Plan better. 🌿
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <div
            className="glass"
            style={{ width: "100%", maxWidth: 440, padding: 28, borderRadius: 16, boxShadow: "0 8px 40px rgba(249,115,22,0.15)" }}
          >
            <h3 style={{ color: "white", marginBottom: 6, marginTop: 0, fontWeight: 700 }}>Reset Password</h3>
            <p style={{ color: "#a8906a", marginBottom: 16, fontSize: 14 }}>
              Enter your email to receive reset instructions.
            </p>
            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Email address"
                required
                style={inputStyle}
              />
              {forgotError && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{forgotError}</p>}
              {forgotMessage && <p style={{ color: "#34d399", fontSize: 13, margin: 0 }}>{forgotMessage}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: 11, borderRadius: 9, fontSize: 14 }}
                >
                  Send Link
                </button>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  style={{ flex: 1, padding: 11, borderRadius: 9, background: "rgba(255,255,255,0.08)", color: "#c4a882", border: "1px solid rgba(249,115,22,0.2)", cursor: "pointer", fontSize: 14 }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
