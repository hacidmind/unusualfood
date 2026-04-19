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

const slotColors: Record<MealSlot, string> = {
  Breakfast: "#f97316",
  Lunch: "#f59e0b",
  Dinner: "#fb923c",
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
    () =>
      mealSlots.reduce<Record<MealSlot, Meal[]>>(
        (acc, slot) => {
          acc[slot] = meals.filter((m) => m.slot === slot);
          return acc;
        },
        { Breakfast: [], Lunch: [], Dinner: [] }
      ),
    []
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
    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Meal plan saved! ✅");
    }
  }, [weeklyPlan, showToast]);

  return (
    <section className="mt-6 space-y-5">
      {/* Settings panel */}
      <div className="glass rounded-2xl p-5 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#fbbf24" }}>Planner Settings</h2>
            <p className="text-sm mt-1" style={{ color: "#a8906a" }}>Customise your week — toggle slots and goals.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setWeightLossMode((prev) => !prev)}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white transition"
              style={{
                background: weightLossMode
                  ? "linear-gradient(135deg, #16a34a, #15803d)"
                  : "linear-gradient(135deg, #b45309, #92400e)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {weightLossMode ? "✅ Weight-Loss ON" : "🔴 Weight-Loss OFF"}
            </button>
            <button
              onClick={newPlan}
              className="rounded-lg px-4 py-2 text-sm font-bold transition"
              style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.35)", color: "#fb923c", cursor: "pointer" }}
            >
              🔀 Shuffle Plan
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {mealSlots.map((slot) => {
            const enabled = selectedSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{
                  cursor: "pointer",
                  ...(enabled
                    ? { background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.5)", color: "#fbbf24" }
                    : { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(249,115,22,0.12)", color: "#6b5a42" }),
                }}
              >
                {slotIcons[slot]} {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day selector */}
      <div className="glass rounded-2xl p-4 shadow-panel">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {weekDays.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDayIndex(idx)}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-all"
                style={{
                  cursor: "pointer",
                  ...(idx === selectedDayIndex
                    ? { background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "white", boxShadow: "0 0 14px rgba(249,115,22,0.4)" }
                    : { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(249,115,22,0.15)", color: "#a8906a" }),
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meal cards for selected day */}
      <article className="glass rounded-2xl p-5 shadow-panel">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold" style={{ color: "#fbbf24" }}>{activeDayPlan.day}</h3>
            <p className="text-sm mt-0.5" style={{ color: "#a8906a" }}>{activeDayPlan.plan.length} meal{activeDayPlan.plan.length !== 1 ? "s" : ""} planned</p>
          </div>
          <button
            onClick={saveMealPlan}
            className="btn-primary rounded-xl px-5 py-2.5 text-sm shadow-glow"
          >
            💾 Save Plan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {activeDayPlan.plan.map(({ slot, meal }) => (
            <MealCard
              key={`${activeDayPlan.day}-${slot}`}
              slot={slot}
              meal={meal}
              totalMealFactor={totalMealFactor}
              slotColor={slotColors[slot]}
              onSwap={() => regenerateMeal(selectedDayIndex, slot)}
            />
          ))}
        </div>
      </article>
    </section>
  );
}

interface MealCardProps {
  slot: MealSlot;
  meal: Meal;
  totalMealFactor: number;
  slotColor: string;
  onSwap: () => void;
}

function MealCard({ slot, meal, totalMealFactor, slotColor, onSwap }: MealCardProps) {
  const [cookOpen, setCookOpen] = useState(false);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all"
      style={{
        background: "rgba(10,6,2,0.7)",
        border: `1px solid rgba(249,115,22,0.2)`,
        borderTop: `3px solid ${slotColor}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <MealImage meal={meal} />

      <div className="flex flex-col flex-1 p-4">
        {/* Slot label + calorie badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: slotColor }}>
            {slotIcons[slot]} {slot}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ background: "rgba(249,115,22,0.18)", color: "#fbbf24", border: "1px solid rgba(249,115,22,0.3)" }}
          >
            {meal.calories} kcal
          </span>
        </div>

        {/* Meal name */}
        <h4 className="text-base font-bold text-white leading-snug mb-1">{meal.name}</h4>
        <p className="text-xs mb-3" style={{ color: "#6b5a42" }}>{meal.dietType}</p>

        {/* Portion info */}
        <div className="text-sm space-y-1 mb-3" style={{ color: "#a8906a" }}>
          <p><span style={{ color: "#6b5a42" }}>Portion:</span> {meal.portion}</p>
          <p><span style={{ color: "#6b5a42" }}>Household:</span> {totalMealFactor.toFixed(1)} portions</p>
        </div>

        {/* Swap button */}
        <button
          onClick={onSwap}
          className="rounded-lg px-3 py-1.5 text-xs font-bold transition mb-3"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c", cursor: "pointer" }}
        >
          🔄 Swap Meal
        </button>

        {/* How to cook accordion */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(249,115,22,0.15)", background: "rgba(0,0,0,0.3)" }}
        >
          <button
            onClick={() => setCookOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold"
            style={{ color: "#f97316", cursor: "pointer", background: "none", border: "none" }}
          >
            <span>👨‍🍳 How to cook</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>{cookOpen ? "▲" : "▼"}</span>
          </button>
          {cookOpen && (
            <ol className="px-4 pb-4 list-decimal pl-9 space-y-1.5" style={{ color: "#c4a882" }}>
              {meal.howToCook.map((step, i) => (
                <li key={i} className="text-sm leading-relaxed">{step}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
