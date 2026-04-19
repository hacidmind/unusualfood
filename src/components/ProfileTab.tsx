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

const inputStyle: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(249,115,22,0.25)",
  background: "rgba(10,6,2,0.65)",
  padding: "11px 13px",
  color: "white",
  fontSize: 14,
  outline: "none",
};

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

  const applyProfile = useCallback(async () => {
    setSaving(true);
    const token = auth.getToken();
    if (!token) {
      showToast("Not authenticated", "error");
      setSaving(false);
      return;
    }

    const result = await api.updateProfile(token, {
      fullName,
      currentWeight,
      weightGoal,
      dietType,
      adultsCount: adults,
      childrenCount: children
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
      setFullName(saved.fullName);
      setCurrentWeight(saved.currentWeight);
      setWeightGoal(saved.weightGoal);
      setDietType(saved.dietType);
      setAdults(saved.adults);
      setChildren(saved.children);
      onSave(saved);
      showToast("Profile saved! ✅");
    }
    setSaving(false);
  }, [fullName, adults, children, currentWeight, weightGoal, dietType, onSave, showToast]);

  const fields = [
    {
      label: "Full Name", icon: "👤",
      input: <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />,
    },
    {
      label: "Adults in household", icon: "🧑",
      input: <input type="number" min={1} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />,
    },
    {
      label: "Children in household", icon: "🧒",
      input: <input type="number" min={0} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} style={inputStyle} />,
    },
    {
      label: "Current Weight (kg)", icon: "⚖️",
      input: <input type="number" min={0} value={currentWeight} onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value) || 0))} style={inputStyle} />,
    },
    {
      label: "Weight Goal (kg)", icon: "🎯",
      input: <input type="number" min={0} value={weightGoal} onChange={(e) => setWeightGoal(Math.max(0, Number(e.target.value) || 0))} style={inputStyle} />,
    },
    {
      label: "Diet Type", icon: "🥗",
      input: (
        <select value={dietType} onChange={(e) => setDietType(e.target.value as DietType)} style={inputStyle}>
          <option value="Mixed">Mixed (African)</option>
          <option value="Vegan">Vegan (African)</option>
        </select>
      ),
    },
  ];

  return (
    <section className="mt-6 glass rounded-2xl p-6 shadow-panel">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold gradient-text">My Profile</h2>
        <p className="mt-1 text-sm" style={{ color: "#a8906a" }}>
          Set your household size and health goals. Changes affect the meal planner.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ label, icon, input }) => (
          <label
            key={label}
            className="block rounded-xl p-4"
            style={{ background: "rgba(10,6,2,0.5)", border: "1px solid rgba(249,115,22,0.18)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "#a8906a" }}>
              {icon} {label}
            </span>
            {input}
          </label>
        ))}
      </div>

      {/* Summary card */}
      <div
        className="mt-5 rounded-xl p-5"
        style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.25)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm" style={{ color: "#a8906a" }}>Serving multiplier</p>
            <p className="gradient-text text-4xl font-extrabold leading-none mt-1">{totalMealFactor.toFixed(1)}x</p>
            <p className="mt-2 text-sm" style={{ color: "#a8906a" }}>
              {adults} adult{adults !== 1 ? "s" : ""} + {children} child{children !== 1 ? "ren" : ""} ={" "}
              <span className="font-semibold" style={{ color: "#16a34a" }}>{totalMealFactor.toFixed(1)} portions</span> per meal
            </p>
          </div>
          <div className="text-sm" style={{ color: "#a8906a" }}>
            <p className="font-semibold mb-1">Weight target</p>
            <p>
              {currentWeight} kg → {weightGoal} kg{" "}
              {currentWeight > weightGoal ? (
                <span style={{ color: "#16a34a" }}>({Math.round(currentWeight - weightGoal)} kg to lose 🔥)</span>
              ) : currentWeight < weightGoal ? (
                <span style={{ color: "#f97316" }}>({Math.round(weightGoal - currentWeight)} kg to gain 💪)</span>
              ) : (
                <span style={{ color: "#16a34a" }}>(at goal ✅)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={applyProfile}
        disabled={saving}
        className="btn-primary mt-6 w-full rounded-xl py-3.5 text-base shadow-glow"
        style={{ background: saving ? undefined : "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 20px rgba(22,163,74,0.3)" }}
      >
        {saving ? "Saving..." : profileApplied ? "✅ Update Profile" : "✅ Apply Profile"}
      </button>
    </section>
  );
}
