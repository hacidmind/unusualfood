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

const APP_BG: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f0d0a 0%, #1e1005 50%, #080f06 100%)",
  minHeight: "100vh",
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("planner");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    fullName: "User",
    adults: 2,
    children: 1,
    currentWeight: 75,
    weightGoal: 65,
    dietType: "Mixed"
  });
  const [profileApplied, setProfileApplied] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsAuthenticated(true);
    api
      .getProfile(token)
      .then((data) => {
        if (data && !data.error) {
          setProfile({
            fullName: data.fullName || "User",
            adults: data.adultsCount || 2,
            children: data.childrenCount || 1,
            currentWeight: data.currentWeight || 75,
            weightGoal: data.weightGoal || 65,
            dietType: data.dietType || "Mixed"
          });
          setProfileApplied(true);
        } else {
          setGlobalError(data?.error || "Failed to load profile.");
        }
      })
      .catch((err) => setGlobalError(`Failed to load profile: ${err.message || err}`))
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
    setProfile({
      fullName: "User",
      adults: 2,
      children: 1,
      currentWeight: 75,
      weightGoal: 65,
      dietType: "Mixed"
    });
  }, []);

  const handleProfileSave = useCallback(
    (data: ProfileData & { adults: number; children: number }) => {
      setProfile(data);
      setProfileApplied(true);
    },
    []
  );

  if (isLoading) {
    return (
      <div style={{ ...APP_BG, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div style={{ textAlign: "center" }}>
          <div className="gradient-text" style={{ fontSize: 42, fontWeight: 800, marginBottom: 8 }}>
            🍽️ Chop Planner
          </div>
          <p style={{ color: "#a8906a", fontSize: 16 }}>Loading your meal plan...</p>
          {globalError && <p style={{ color: "#f87171", marginTop: 16 }}>{globalError}</p>}
        </div>
      </div>
    );
  }

  if (isResetPage) {
    return (
      <ToastProvider>
        <ResetPasswordPage />
      </ToastProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <LoginSignUp onAuthenticated={handleAuthenticated} />
      </ToastProvider>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "planner", label: "Meal Planner", icon: "🗓️" },
    { key: "profile", label: "My Profile",   icon: "👤" },
    { key: "saved",   label: "Saved Plans",  icon: "📋" },
  ];

  return (
    <ToastProvider>
      <div style={APP_BG} className="text-white">
        <div className="mx-auto max-w-6xl p-4 md:p-8">

          {/* Header */}
          <header className="glass rounded-2xl p-6 shadow-panel md:p-10" style={{ boxShadow: "0 8px 40px rgba(249,115,22,0.12), 0 2px 8px rgba(0,0,0,0.6)" }}>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="gradient-text text-4xl font-extrabold leading-tight md:text-5xl">
                  The Unusual Chop Planner
                </h1>
                <p className="mt-2 text-base" style={{ color: "#a8906a" }}>
                  Your weekly Lagos meal plan — eat well, live well. 🌶️
                </p>
              </div>
              <div className="text-right shrink-0">
                <p style={{ color: "#a8906a", fontSize: 14 }}>
                  Welcome back,{" "}
                  <span className="font-bold" style={{ color: "#fbbf24" }}>{profile.fullName}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-3 rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "#ef4444" }}
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Global error banner */}
          {globalError && (
            <div className="mt-6 rounded-xl border border-red-700/50 p-4" style={{ background: "rgba(239,68,68,0.1)" }}>
              <p className="text-sm text-red-300">
                <span className="font-bold">Error:</span> {globalError}
              </p>
              <button
                onClick={() => setGlobalError(null)}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab nav */}
          <nav className="mt-6 flex flex-wrap gap-3">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                  activeTab === key
                    ? "btn-primary shadow-glow"
                    : "border hover:border-orange-600/50 hover:text-orange-300"
                }`}
                style={
                  activeTab === key
                    ? {}
                    : { background: "rgba(10,6,2,0.5)", borderColor: "rgba(249,115,22,0.2)", color: "#c4a882" }
                }
              >
                {icon} {label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          {activeTab === "planner" && (
            <PlannerTab
              adults={profile.adults}
              children={profile.children}
              dietType={profile.dietType}
              profileApplied={profileApplied}
            />
          )}
          {activeTab === "profile" && (
            <ProfileTab
              fullName={profile.fullName}
              adults={profile.adults}
              children={profile.children}
              currentWeight={profile.currentWeight}
              weightGoal={profile.weightGoal}
              dietType={profile.dietType}
              profileApplied={profileApplied}
              onSave={handleProfileSave}
            />
          )}
          {activeTab === "saved" && <SavedPlansTab />}
        </div>
      </div>
    </ToastProvider>
  );
}
