import { useState, useEffect, useCallback } from "react";
import { type DietType } from "./data/meals";
import { api, auth } from "./services/api";
import { ToastProvider } from "./components/Toast";
import { LoginSignUp } from "./components/LoginSignUp";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { PlannerTab } from "./components/PlannerTab";
import { ProfileTab } from "./components/ProfileTab";
import { SavedPlansTab } from "./components/SavedPlansTab";

type TabKey = "planner" | "profile" | "saved";

interface ProfileData {
  fullName: string;
  adults: number;
  children: number;
  currentWeight: number;
  weightGoal: number;
  dietType: DietType;
}

const isResetPage =
  typeof window !== "undefined" && window.location.pathname === "/reset-password";

const DEFAULT_PROFILE: ProfileData = {
  fullName: "User",
  adults: 2,
  children: 1,
  currentWeight: 75,
  weightGoal: 65,
  dietType: "Mixed",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("planner");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [profileApplied, setProfileApplied] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) { setIsLoading(false); return; }
    setIsAuthenticated(true);

    api.getProfile(token)
      .then((data) => {
        if (data.error) {
          setGlobalError(String(data.error));
          return;
        }
        setProfile({
          fullName:      String(data.fullName      ?? "User"),
          adults:        Number(data.adultsCount   ?? 2),
          children:      Number(data.childrenCount ?? 1),
          currentWeight: Number(data.currentWeight ?? 75),
          weightGoal:    Number(data.weightGoal    ?? 65),
          dietType:     (data.dietType as DietType) ?? "Mixed",
        });
        setProfileApplied(true);
      })
      .catch(() => setGlobalError("Could not reach server. Check that the backend is running."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAuthenticated = useCallback((fullName: string) => {
    setProfile((prev) => ({ ...prev, fullName }));
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    auth.clearToken();
    setIsAuthenticated(false);
    setProfileApplied(false);
    setProfile(DEFAULT_PROFILE);
  }, []);

  const handleProfileSave = useCallback(
    (data: ProfileData & { adults: number; children: number }) => {
      setProfile(data);
      setProfileApplied(true);
    }, []
  );

  if (isLoading) {
    return (
      <div className="app-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
          <h1 className="brand-text" style={{ fontSize: 32, margin: 0 }}>Chop Planner</h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Loading your meal plan…</p>
        </div>
      </div>
    );
  }

  if (isResetPage) {
    return <ToastProvider><ResetPasswordPage isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} /></ToastProvider>;
  }

  if (!isAuthenticated) {
    return <ToastProvider><LoginSignUp onAuthenticated={handleAuthenticated} isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} /></ToastProvider>;
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "planner", label: "Meal Planner", icon: "🗓️" },
    { key: "profile", label: "My Profile",   icon: "👤" },
    { key: "saved",   label: "Saved Plans",  icon: "📋" },
  ];

  return (
    <ToastProvider>
      <div className="app-bg">
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px 16px 48px" }}>

          {/* Header */}
          <header className="card" style={{ padding: "20px 28px", marginBottom: 20, boxShadow: "var(--shadow-hdr)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 32 }}>🍽️</span>
                <div>
                  <h1 className="brand-text" style={{ fontSize: 22, margin: 0, letterSpacing: "-0.3px" }}>
                    The Unusual Chop Planner
                  </h1>
                  <p style={{ color: "var(--text-3)", fontSize: 13, margin: "2px 0 0" }}>
                    Your weekly Lagos meal plan · eat well, live well
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Theme toggle */}
                <button className="theme-toggle" onClick={() => setIsDark(d => !d)} title="Toggle theme">
                  {isDark ? "☀️" : "🌙"}
                  <span style={{ fontSize: 13 }}>{isDark ? "Light" : "Dark"}</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--text-2)", fontSize: 14 }}>
                    Hi, <span style={{ fontWeight: 700, color: "var(--text-1)" }}>{profile.fullName}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost"
                    style={{ padding: "6px 14px", fontSize: 13 }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Global error */}
          {globalError && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 16 }}>
              <p style={{ color: "var(--red)", fontSize: 14, margin: 0 }}>
                <strong>Error:</strong> {globalError}
              </p>
              <button onClick={() => setGlobalError(null)} style={{ color: "var(--red)", background: "none", border: "none", cursor: "pointer", fontSize: 13, marginTop: 6, padding: 0 }}>
                Dismiss
              </button>
            </div>
          )}

          {/* Tab nav */}
          <nav style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  borderRadius: "var(--radius-pill)",
                  padding: "9px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  ...(activeTab === key
                    ? { background: "var(--green)", color: "#fff", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }
                    : { background: "var(--bg-card)", color: "var(--text-2)", border: "1px solid var(--border)" }),
                }}
              >
                {icon} {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          {activeTab === "planner" && (
            <PlannerTab adults={profile.adults} children={profile.children} dietType={profile.dietType} profileApplied={profileApplied} />
          )}
          {activeTab === "profile" && (
            <ProfileTab fullName={profile.fullName} adults={profile.adults} children={profile.children} currentWeight={profile.currentWeight} weightGoal={profile.weightGoal} dietType={profile.dietType} profileApplied={profileApplied} onSave={handleProfileSave} />
          )}
          {activeTab === "saved" && <SavedPlansTab />}
        </div>
      </div>
    </ToastProvider>
  );
}
