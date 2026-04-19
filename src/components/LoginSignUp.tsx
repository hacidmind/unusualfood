import { useState } from "react";
import { api, auth } from "../services/api";

type AuthScreen = "login" | "register";

interface Props {
  onAuthenticated: (data: { fullName: string; adults?: number; children?: number; currentWeight?: number; weightGoal?: number; dietType?: string }) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LoginSignUp({ onAuthenticated, isDark, onToggleTheme }: Props) {
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
      const result = screen === "login"
        ? await api.login(email, password)
        : await api.register(email, password, fullName);

      if (result.error) {
        setError(String(result.error));
      } else if (result.token) {
        auth.setToken(String(result.token));
        const u = result.user as Record<string, unknown> | undefined;
        onAuthenticated({
          fullName:      String(u?.fullName || fullName || "User"),
          adults:        u?.adultsCount   != null ? Number(u.adultsCount)   : undefined,
          children:      u?.childrenCount != null ? Number(u.childrenCount) : undefined,
          currentWeight: u?.currentWeight != null ? Number(u.currentWeight) : undefined,
          weightGoal:    u?.weightGoal    != null ? Number(u.weightGoal)    : undefined,
          dietType:      u?.dietType      != null ? String(u.dietType)      : undefined,
        });
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
      if (result.error) setForgotError(String(result.error));
      else setForgotMessage(String(result.message || "If an account exists, instructions were sent."));
    } catch {
      setForgotError("Failed to contact server.");
    }
  };

  return (
    <div className="app-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Theme toggle — top right */}
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {isDark ? "☀️" : "🌙"}
          <span style={{ fontSize: 13 }}>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
          <h1 className="brand-text" style={{ fontSize: 28, margin: 0 }}>Chop Planner</h1>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 6 }}>Your weekly Lagos meal plan</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px 28px" }}>
          {/* Screen switcher */}
          <div style={{ display: "flex", background: "var(--bg-card-2)", borderRadius: 10, padding: 4, marginBottom: 24, border: "1px solid var(--border)" }}>
            {(["login", "register"] as AuthScreen[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setScreen(s); setError(""); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                  ...(screen === s
                    ? { background: "var(--green)", color: "#fff", boxShadow: "0 2px 8px rgba(22,163,74,0.25)" }
                    : { background: "transparent", color: "var(--text-3)" }),
                }}
              >
                {s === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {screen === "register" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Full Name</label>
                <input className="theme-input" type="text" placeholder="e.g. Chidi Okafor" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email address</label>
              <input className="theme-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Password</label>
                {screen === "login" && (
                  <button type="button" onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotMessage(""); setForgotError(""); }}
                    style={{ background: "none", border: "none", color: "var(--orange)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input className="theme-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <p style={{ color: "var(--red)", fontSize: 13, margin: 0, padding: "10px 12px", background: "rgba(239,68,68,0.07)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-green"
              style={{ padding: "13px 0", fontSize: 15, borderRadius: 10, marginTop: 4, width: "100%" }}>
              {loading ? "Loading…" : screen === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, marginTop: 20 }}>
          Eat well · Live well · Plan better 🌿
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <div className="card" style={{ width: "100%", maxWidth: 420, padding: "28px 24px" }}>
            <h3 style={{ color: "var(--text-1)", margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>Reset Password</h3>
            <p style={{ color: "var(--text-2)", marginBottom: 16, fontSize: 14 }}>
              Enter your email to receive reset instructions.
            </p>
            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="theme-input" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Email address" required />
              {forgotError && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{forgotError}</p>}
              {forgotMessage && <p style={{ color: "var(--green)", fontSize: 13, margin: 0 }}>{forgotMessage}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn-green" style={{ flex: 1, padding: 11, borderRadius: 9, fontSize: 14 }}>Send Link</button>
                <button type="button" onClick={() => setForgotOpen(false)} className="btn-ghost" style={{ flex: 1, padding: 11, borderRadius: 9, fontSize: 14 }}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
