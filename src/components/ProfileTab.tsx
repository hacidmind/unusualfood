import { useState, useCallback } from "react";
import { type DietType } from "../data/meals";
import { api, auth } from "../services/api";
import { useToast } from "./Toast";

interface ProfileData {
  fullName: string;
  adults: number;
  children: number;
  currentWeight: number;
  weightGoal: number;
  dietType: DietType;
}

interface Props extends ProfileData {
  profileApplied: boolean;
  onSave: (data: ProfileData) => void;
}

export function ProfileTab({
  fullName: initialFullName,
  adults: initialAdults,
  children: initialChildren,
  currentWeight: initialCurrentWeight,
  weightGoal: initialWeightGoal,
  dietType: initialDietType,
  profileApplied,
  onSave
}: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [currentWeight, setCurrentWeight] = useState(initialCurrentWeight);
  const [weightGoal, setWeightGoal] = useState(initialWeightGoal);
  const [dietType, setDietType] = useState<DietType>(initialDietType);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const totalMealFactor = adults + children * 0.6;
  const weightDiff = currentWeight - weightGoal;

  const applyProfile = useCallback(async () => {
    setSaving(true);
    const token = auth.getToken();
    if (!token) { showToast("Not authenticated", "error"); setSaving(false); return; }

    const result = await api.updateProfile(token, {
      fullName, currentWeight, weightGoal, dietType, adultsCount: adults, childrenCount: children
    });

    if (result.error) {
      showToast(result.error, "error");
    } else {
      const u = result.user;
      const saved: ProfileData = {
        fullName: u?.fullName ?? fullName,
        currentWeight: typeof u?.currentWeight === "number" ? u.currentWeight : currentWeight,
        weightGoal: typeof u?.weightGoal === "number" ? u.weightGoal : weightGoal,
        dietType: u?.dietType ?? dietType,
        adults: u?.adultsCount ?? adults,
        children: u?.childrenCount ?? children
      };
      setFullName(saved.fullName); setCurrentWeight(saved.currentWeight);
      setWeightGoal(saved.weightGoal); setDietType(saved.dietType);
      setAdults(saved.adults); setChildren(saved.children);
      onSave(saved);
      showToast("Profile saved! ✅");
    }
    setSaving(false);
  }, [fullName, adults, children, currentWeight, weightGoal, dietType, onSave, showToast]);

  const fields = [
    { label: "Full Name", icon: "👤", node: <input className="theme-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ marginTop: 8 }} /> },
    { label: "Adults", icon: "🧑", node: <input className="theme-input" type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} style={{ marginTop: 8 }} /> },
    { label: "Children", icon: "🧒", node: <input className="theme-input" type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} style={{ marginTop: 8 }} /> },
    { label: "Current Weight (kg)", icon: "⚖️", node: <input className="theme-input" type="number" min={0} value={currentWeight} onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value) || 0))} style={{ marginTop: 8 }} /> },
    { label: "Weight Goal (kg)", icon: "🎯", node: <input className="theme-input" type="number" min={0} value={weightGoal} onChange={(e) => setWeightGoal(Math.max(0, Number(e.target.value) || 0))} style={{ marginTop: 8 }} /> },
    {
      label: "Diet Type", icon: "🥗",
      node: (
        <select className="theme-input" value={dietType} onChange={(e) => setDietType(e.target.value as DietType)} style={{ marginTop: 8 }}>
          <option value="Mixed">Mixed (African)</option>
          <option value="Vegan">Vegan (African)</option>
        </select>
      )
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>My Profile</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>
            Set your household size and health goals — changes affect the meal planner.
          </p>
        </div>

        {/* Fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
          {fields.map(({ label, icon, node }) => (
            <label key={label} style={{ display: "block", padding: "14px 16px", background: "var(--bg-card-2)", border: "1px solid var(--border)", borderRadius: 12, cursor: "default" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>{icon} {label}</span>
              {node}
            </label>
          ))}
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {/* Serving multiplier */}
          <div style={{ background: "var(--bg-green-soft)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Serving Multiplier</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "var(--green)", lineHeight: 1 }}>{totalMealFactor.toFixed(1)}x</p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-2)" }}>
              {adults} adult{adults !== 1 ? "s" : ""} + {children} child{children !== 1 ? "ren" : ""}
            </p>
          </div>

          {/* Weight target */}
          <div style={{ background: "var(--bg-accent)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weight Target</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>
              {currentWeight} → {weightGoal} kg
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-2)" }}>
              {weightDiff > 0
                ? <span style={{ color: "var(--green)", fontWeight: 700 }}>🔥 {Math.round(weightDiff)} kg to lose</span>
                : weightDiff < 0
                  ? <span style={{ color: "var(--orange)", fontWeight: 700 }}>💪 {Math.round(-weightDiff)} kg to gain</span>
                  : <span style={{ color: "var(--green)", fontWeight: 700 }}>✅ At goal!</span>
              }
            </p>
          </div>
        </div>

        <button onClick={applyProfile} disabled={saving} className="btn-green"
          style={{ width: "100%", padding: "14px 0", fontSize: 15, borderRadius: 12 }}>
          {saving ? "Saving…" : profileApplied ? "✅ Update Profile" : "✅ Apply Profile"}
        </button>
      </div>
    </div>
  );
}
