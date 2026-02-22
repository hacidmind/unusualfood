import { useMemo, useState } from "react";
import { meals, type Meal, type MealSlot, weekDays } from "./data/meals";

type TabKey = "planner" | "people";

const mealSlots: MealSlot[] = ["Breakfast", "Lunch", "Dinner"];
const slotIcons: Record<MealSlot, string> = {
  Breakfast: "🍳",
  Lunch: "🍲",
  Dinner: "🍽️"
};

const mealImageMap: Record<string, string> = {
  "Pap (Ogi) and Moi Moi":
    "https://media.premiumtimesng.com/wp-content/files/2020/11/Akamu-cover-pic.jpg",
  "Yam and Egg Sauce":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX18gSnAMoYZEV3qsDd2W7vPjBTE-DALSdng&s",
  "Ofada Rice and Ayamase (Light)":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZcckYYpEV6divYH_qqRbcFopBv78SIyX3g&s",
  "Jollof Rice and Grilled Chicken":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyyuGA5P81pMfWntKakMF4LtW0FEWVogtfEQ&s",
  "Efo Riro with Fish and Small Swallow":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdddqo1YIX3mfXKbZLntAH-UH5n-_fghDRJA&s",
  "Beans and Plantain":
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZcckYYpEV6divYH_qqRbcFopBv78SIyX3g&s"
};

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("planner");
  const [weightLossMode, setWeightLossMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<MealSlot[]>(["Breakfast", "Lunch", "Dinner"]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const totalMealFactor = adults + children * 0.6;

  const mealsBySlot = useMemo(() => {
    return mealSlots.reduce<Record<MealSlot, Meal[]>>(
      (acc, slot) => {
        const slotMeals = meals.filter((meal) => meal.slot === slot);
        acc[slot] = weightLossMode ? slotMeals.filter((meal) => meal.weightLossFriendly) : slotMeals;
        if (acc[slot].length === 0) acc[slot] = slotMeals;
        return acc;
      },
      { Breakfast: [], Lunch: [], Dinner: [] }
    );
  }, [weightLossMode]);

  const weeklyPlan = useMemo(() => {
    return weekDays.map((day, dayIndex) => {
      const plan = selectedSlots.map((slot) => {
        const options = mealsBySlot[slot];
        const meal = options[dayIndex % options.length];
        return { slot, meal };
      });
      return { day, plan };
    });
  }, [mealsBySlot, selectedSlots]);

  const activeDayPlan = weeklyPlan[selectedDayIndex];

  function toggleSlot(slot: MealSlot) {
    setSelectedSlots((prev) => {
      const hasSlot = prev.includes(slot);
      if (hasSlot && prev.length === 1) return prev;
      if (hasSlot) return prev.filter((s) => s !== slot);
      return [...prev, slot];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryBlack via-slate-950 to-primaryBlue text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <header
          className="rounded-2xl border border-slate-700 bg-slate-900/80 p-10 text-center shadow-panel md:p-16">
          <h1 className="text-[48px] font-bold leading-tight text-white-900"
          >🍽️ The Unusual Chop Planner</h1>
          <h3 className="mt-4 text-[36px] font-medium leading-tight text-slate-200">
            Your weekly Lagos meal plan - eat well, live well
          </h3>
        </header>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "planner" ? "bg-primaryBlue text-white" : "bg-slate-800 text-slate-200"
              }`}
            onClick={() => setActiveTab("planner")}
          >
            Meal Planner
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "people" ? "bg-primaryBlue text-white" : "bg-slate-800 text-slate-200"
              }`}
            onClick={() => setActiveTab("people")}
          >
            People Per Meal
          </button>
        </div>

        {activeTab === "planner" ? (
          <section className="mt-6 space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Planner Settings</h2>
                  <p className="text-sm text-slate-300">Choose meal slots and optional weight-loss mode.</p>
                </div>
                <button
                  onClick={() => setWeightLossMode((prev) => !prev)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold ${weightLossMode ? "bg-secondaryGreen text-white" : "bg-secondaryRed text-white"
                    }`}
                >
                  Weight-Loss Mode: {weightLossMode ? "ON" : "OFF"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {mealSlots.map((slot) => {
                  const enabled = selectedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${enabled
                          ? "border-blue-400 bg-blue-900/60 text-blue-100"
                          : "border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-panel">
              <div className="overflow-x-auto">
                <div className="flex min-w-max gap-2">
                  {weekDays.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${idx === selectedDayIndex
                          ? "bg-primaryBlue text-white"
                          : "border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-panel">
              <h3 className="text-xl font-semibold text-blue-200">{activeDayPlan.day}</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {activeDayPlan.plan.map(({ slot, meal }) => (
                  <div key={`${activeDayPlan.day}-${slot}`} className="h-full rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <img
                      src={mealImageMap[meal.name]}
                      alt={meal.name}
                      className="aspect-[16/9] w-full rounded-lg object-cover"
                      // className="w-24 h-24 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-secondaryGreen">
                          {slotIcons[slot]} {slot}
                        </p>
                        <h4 className="text-lg font-semibold text-slate-100">{meal.name}</h4>
                      </div>
                      <p className="rounded-md bg-primaryBlue px-2 py-1 text-xs font-semibold">{meal.calories} kcal</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">Portion: {meal.portion}</p>
                    <p className="mt-1 text-sm text-slate-300">For your household: {totalMealFactor.toFixed(1)} portions</p>
                    <details className="mt-3 rounded-md border border-slate-700 bg-slate-900/70 p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-secondaryGreen">How to cook</summary>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
                        {meal.howToCook.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </details>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-panel">
            <h2 className="text-2xl font-semibold text-blue-200">People Per Meal</h2>
            <p className="mt-2 text-slate-300">
              Set household size. Adult serving factor is 1.0 and child serving factor is 0.6.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Adults</span>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>
              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Children</span>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-blue-900 bg-blue-950/40 p-4">
              <p className="text-sm text-slate-300">Total serving multiplier</p>
              <p className="text-3xl font-bold text-blue-200">{totalMealFactor.toFixed(1)}x</p>
              <p className="mt-2 text-sm text-slate-300">
                Example: 2 adults and 1 child equals <span className="font-semibold text-secondaryGreen">2.6 portions</span> per meal.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
