import { useMemo, useState, useCallback } from "react";
import { meals, type Meal, type MealSlot, type DietType, weekDays } from "../data/meals";
import { seededShuffle } from "../utils/random";
import { MealImage } from "./MealImage";
import { api, auth } from "../services/api";
import { useToast } from "./Toast";

const mealSlots: MealSlot[] = ["Breakfast", "Lunch", "Dinner"];

const slotIcons: Record<MealSlot, string> = {
  Breakfast: "🍳",
  Lunch: "🍲",
  Dinner: "🍽️"
};

const slotAccent: Record<MealSlot, { bg: string; color: string; border: string }> = {
  Breakfast: { bg: "#FFF7ED", color: "#EA580C", border: "rgba(249,115,22,0.3)" },
  Lunch:     { bg: "#F0FDF4", color: "#15803D", border: "rgba(22,163,74,0.3)"  },
  Dinner:    { bg: "#FEF3C7", color: "#B45309", border: "rgba(245,158,11,0.3)" },
};

interface Props {
  adults: number;
  children: number;
  dietType: DietType;
  profileApplied: boolean;
}

export function PlannerTab({ adults, children: childCount, dietType, profileApplied }: Props) {
  const [weightLossMode, setWeightLossMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<MealSlot[]>(["Breakfast", "Lunch", "Dinner"]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [planSeed, setPlanSeed] = useState(() => Date.now());
  const [mealOffsets, setMealOffsets] = useState<Record<string, number>>({});
  const { showToast } = useToast();

  const totalMealFactor = adults + childCount * 0.6;

  const allMealsForSlot = useMemo(
    () => mealSlots.reduce<Record<MealSlot, Meal[]>>(
      (acc, slot) => { acc[slot] = meals.filter((m) => m.slot === slot); return acc; },
      { Breakfast: [], Lunch: [], Dinner: [] }
    ), []
  );

  const filteredMeals = useMemo(() => {
    const result = {} as Record<MealSlot, Meal[]>;
    for (const slot of mealSlots) {
      let filtered = allMealsForSlot[slot];
      if (weightLossMode) filtered = filtered.filter((m) => m.weightLossFriendly);
      if (profileApplied) filtered = filtered.filter((m) => m.dietType === dietType);
      result[slot] = filtered.length > 0 ? filtered : allMealsForSlot[slot];
    }
    return result;
  }, [weightLossMode, dietType, profileApplied, allMealsForSlot]);

  const weeklyPlan = useMemo(() => {
    return weekDays.map((day, dayIndex) => {
      const plan = selectedSlots.map((slot, slotIndex) => {
        const options = filteredMeals[slot];
        const cellSeed = planSeed + slotIndex * 100_000 + dayIndex;
        const shuffled = seededShuffle(options, cellSeed);
        const offset = mealOffsets[`${dayIndex}-${slot}`] || 0;
        const meal = shuffled[offset % shuffled.length];
        return { slot, meal };
      });
      return { day, plan };
    });
  }, [filteredMeals, selectedSlots, planSeed, mealOffsets]);

  const activeDayPlan = weeklyPlan[selectedDayIndex];

  const toggleSlot = useCallback((slot: MealSlot) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slot) && prev.length === 1) return prev;
      return prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot];
    });
  }, []);

  const regenerateMeal = useCallback((dayIndex: number, slot: MealSlot) => {
    setMealOffsets((prev) => ({
      ...prev,
      [`${dayIndex}-${slot}`]: (prev[`${dayIndex}-${slot}`] || 0) + 1
    }));
  }, []);

  const newPlan = useCallback(() => {
    setPlanSeed(Date.now());
    setMealOffsets({});
    showToast("New plan generated! 🎉");
  }, [showToast]);

  const saveMealPlan = useCallback(async () => {
    const token = auth.getToken();
    if (!token) return;
    const result = await api.savePlan(
      token,
      `Plan — ${new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}`,
      weeklyPlan
    );
    if (result.error) showToast(String(result.error), "error");
    else showToast("Meal plan saved! ✅");
  }, [weeklyPlan, showToast]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Settings panel */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>Planner Settings</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>Toggle meal slots and dietary goals</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setWeightLossMode((p) => !p)}
              style={{
                padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                background: weightLossMode ? "var(--green)" : "var(--bg-card-2)",
                color: weightLossMode ? "#fff" : "var(--text-2)",
                border: `1px solid ${weightLossMode ? "var(--green)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}
            >
              {weightLossMode ? "✅ Weight-Loss ON" : "⚖️ Weight-Loss OFF"}
            </button>
            <button onClick={newPlan} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
              🔀 Shuffle Plan
            </button>
          </div>
        </div>

        {/* Slot toggles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {mealSlots.map((slot) => {
            const on = selectedSlots.includes(slot);
            const acc = slotAccent[slot];
            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  background: on ? acc.bg : "var(--bg-card-2)",
                  color: on ? acc.color : "var(--text-3)",
                  border: `1px solid ${on ? acc.border : "var(--border)"}`,
                }}
              >
                {slotIcons[slot]} {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day selector */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
            {weekDays.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDayIndex(idx)}
                style={{
                  padding: "8px 16px", borderRadius: "var(--radius-pill)", fontWeight: 700,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", border: "none",
                  ...(idx === selectedDayIndex
                    ? { background: "var(--green)", color: "#fff", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }
                    : { background: "var(--bg-card-2)", color: "var(--text-2)", border: "1px solid var(--border)" }),
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Day meals */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>{activeDayPlan.day}</h3>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-3)" }}>
              {activeDayPlan.plan.length} meal{activeDayPlan.plan.length !== 1 ? "s" : ""} planned
            </p>
          </div>
          <button onClick={saveMealPlan} className="btn-green" style={{ padding: "10px 20px", fontSize: 14, borderRadius: 10 }}>
            💾 Save Plan
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {activeDayPlan.plan.map(({ slot, meal }) => (
            <MealCard
              key={`${activeDayPlan.day}-${slot}`}
              slot={slot}
              meal={meal}
              totalMealFactor={totalMealFactor}
              onSwap={() => regenerateMeal(selectedDayIndex, slot)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MealCardProps {
  slot: MealSlot;
  meal: Meal;
  totalMealFactor: number;
  onSwap: () => void;
}

function MealCard({ slot, meal, totalMealFactor, onSwap }: MealCardProps) {
  const [cookOpen, setCookOpen] = useState(false);
  const acc = slotAccent[slot];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
    >
      {/* Image */}
      <div style={{ borderRadius: "var(--radius) var(--radius) 0 0", overflow: "hidden" }}>
        <MealImage meal={meal} />
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Slot + calorie row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ background: acc.bg, color: acc.color, border: `1px solid ${acc.border}`, borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "3px 10px" }}>
            {slotIcons[slot]} {slot}
          </span>
          <span className="badge-orange">{meal.calories} kcal</span>
        </div>

        {/* Name */}
        <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{meal.name}</h4>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-3)" }}>{meal.dietType}</p>

        {/* Portion info */}
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.7 }}>
          <span style={{ color: "var(--text-3)" }}>Portion:</span> {meal.portion}<br />
          <span style={{ color: "var(--text-3)" }}>Household:</span> {totalMealFactor.toFixed(1)} portions
        </div>

        {/* Swap */}
        <button
          onClick={onSwap}
          className="btn-ghost"
          style={{ padding: "7px 12px", fontSize: 12, marginBottom: 10, width: "100%", textAlign: "center" }}
        >
          🔄 Swap Meal
        </button>

        {/* How to cook */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <button
            onClick={() => setCookOpen((o) => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", background: "var(--bg-card-2)", border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--green)", fontFamily: "inherit",
            }}
          >
            <span>👨‍🍳 How to cook</span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>{cookOpen ? "▲" : "▼"}</span>
          </button>
          {cookOpen && (
            <ol style={{ margin: 0, padding: "10px 14px 12px 28px", color: "var(--text-2)", fontSize: 13, lineHeight: 1.7 }}>
              {meal.howToCook.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
