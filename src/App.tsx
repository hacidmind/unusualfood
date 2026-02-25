import { useMemo, useState, useEffect } from "react";
import { meals, type Meal, type MealSlot, type DietType, weekDays } from "./data/meals";
import { api, auth } from "./services/api";

type TabKey = "planner" | "profile";
type AuthScreen = "login" | "register" | null;

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
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZcckYYpEV6divYH_qqRbcFopBv78SIyX3g&s",
  "Egg White Omelette and Whole Wheat Toast":
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400",
  "Grilled Fish and Steamed Vegetables":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "Vegetable Soup with Lean Chicken":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "Akamu and Akara":
    "https://images.unsplash.com/photo-1630383249896-424e7b14320e?w=400",
  "Eba and Light Egusi Soup":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "Okra Soup with Fufu":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "Smoothie Bowl with Fruits":
    "https://images.unsplash.com/photo-1590080876351-cd8c26fe7e0a?w=400",
  "Lentil and Vegetable Stew":
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
  "Roasted Vegetables and Quinoa":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
};

function LoginSignUp() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        auth.setToken(result.token);
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure backend is running on port 5000");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.register(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        auth.setToken(result.token);
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure backend is running on port 5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryBlack via-slate-950 to-primaryBlue flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/90 p-8 shadow-panel">
        <h1 className="text-3xl font-bold text-white text-center mb-2">🍽️ Chop Planner</h1>
        <p className="text-slate-300 text-center mb-8">Your weekly Lagos meal plan</p>

        <form onSubmit={authScreen === "login" ? handleLogin : handleRegister} className="space-y-4">
          {authScreen === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white placeholder-slate-400"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white placeholder-slate-400"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white placeholder-slate-400"
            required
          />

          {error && <p className="text-secondaryRed text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primaryBlue px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loading..." : authScreen === "login" ? "Login" : "Register"}
          </button>
        </form>

        <button
          onClick={() => {
            setAuthScreen(authScreen === "login" ? "register" : "login");
            setError("");
          }}
          className="w-full mt-4 text-center text-slate-300 hover:text-white text-sm transition"
        >
          {authScreen === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("planner");
  const [weightLossMode, setWeightLossMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<MealSlot[]>(["Breakfast", "Lunch", "Dinner"]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [currentWeight, setCurrentWeight] = useState(75);
  const [weightGoal, setWeightGoal] = useState(65);
  const [dietType, setDietType] = useState<DietType>("Mixed");
  const [profileApplied, setProfileApplied] = useState(false);
  const [fullName, setFullName] = useState("User");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    if (token) {
      setIsAuthenticated(true);
      api.getProfile(token).then((data) => {
        if (!data.error) {
          setFullName(data.fullName);
          setCurrentWeight(data.currentWeight || 75);
          setWeightGoal(data.weightGoal || 65);
          setDietType(data.dietType || "Mixed");
          setAdults(data.adultsCount || 2);
          setChildren(data.childrenCount || 1);
          setProfileApplied(true);
        }
      });
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginSignUp />;
  }

  const totalMealFactor = adults + children * 0.6;

  const allMealsForSlot = useMemo(() => {
    return mealSlots.reduce<Record<MealSlot, Meal[]>>(
      (acc, slot) => {
        acc[slot] = meals.filter((meal) => meal.slot === slot);
        return acc;
      },
      { Breakfast: [], Lunch: [], Dinner: [] }
    );
  }, []);

  const filteredMeals = useMemo(() => {
    const result = {} as Record<MealSlot, Meal[]>;
    for (const slot of mealSlots) {
      let filtered = allMealsForSlot[slot];
      if (weightLossMode) {
        filtered = filtered.filter((meal) => meal.weightLossFriendly);
      }
      if (profileApplied) {
        filtered = filtered.filter((meal) => meal.dietType === dietType);
      }
      result[slot] = filtered.length > 0 ? filtered : allMealsForSlot[slot];
    }
    return result;
  }, [weightLossMode, dietType, profileApplied, allMealsForSlot]);

  const weeklyPlan = useMemo(() => {
    return weekDays.map((day, dayIndex) => {
      const plan = selectedSlots.map((slot) => {
        const options = filteredMeals[slot];
        const mealIndex = dayIndex % Math.max(options.length, 1);
        const meal = options[mealIndex] || allMealsForSlot[slot][0];
        return { slot, meal };
      });
      return { day, plan };
    });
  }, [filteredMeals, selectedSlots, allMealsForSlot]);

  const activeDayPlan = weeklyPlan[selectedDayIndex];

  function toggleSlot(slot: MealSlot) {
    setSelectedSlots((prev) => {
      const hasSlot = prev.includes(slot);
      if (hasSlot && prev.length === 1) return prev;
      if (hasSlot) return prev.filter((s) => s !== slot);
      return [...prev, slot];
    });
  }

  async function applyProfile() {
    setSaving(true);
    const token = auth.getToken();
    if (token) {
      const result = await api.updateProfile(token, {
        fullName,
        currentWeight,
        weightGoal,
        dietType,
        adultsCount: adults,
        childrenCount: children
      });

      if (!result.error) {
        setProfileApplied(true);
      }
    }
    setSaving(false);
  }

  async function saveMealPlan() {
    const token = auth.getToken();
    if (token) {
      await api.savePlan(token, `Plan for ${new Date().toLocaleDateString()}`, weeklyPlan);
      alert("Meal plan saved successfully!");
    }
  }

  function logout() {
    auth.clearToken();
    setIsAuthenticated(false);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryBlack via-slate-950 to-primaryBlue text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <header className="rounded-2xl border border-slate-700 bg-slate-900/80 p-10 text-center shadow-panel md:p-16 flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <h1 className="text-[48px] font-bold leading-tight text-white-900">🍽️ The Unusual Chop Planner</h1>
            <h3 className="mt-4 text-[36px] font-medium leading-tight text-slate-200">
              Your weekly Lagos meal plan - eat well, live well
            </h3>
          </div>
          <div className="mt-6 md:mt-0">
            <p className="text-slate-300">Welcome, <span className="font-bold text-blue-200">{fullName}</span></p>
            <button
              onClick={logout}
              className="mt-3 rounded-lg bg-secondaryRed px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "planner" ? "bg-primaryBlue text-white" : "bg-slate-800 text-slate-200"}`}
            onClick={() => setActiveTab("planner")}
          >
            Meal Planner
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "profile" ? "bg-primaryBlue text-white" : "bg-slate-800 text-slate-200"}`}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
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
                  className={`rounded-lg px-4 py-2 text-sm font-bold ${weightLossMode ? "bg-secondaryGreen text-white" : "bg-secondaryRed text-white"}`}
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
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        enabled ? "border-blue-400 bg-blue-900/60 text-blue-100" : "border-slate-600 bg-slate-800 text-slate-300"
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
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        idx === selectedDayIndex
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-blue-200">{activeDayPlan.day}</h3>
                <button
                  onClick={saveMealPlan}
                  className="rounded-lg bg-primaryBlue px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Save Plan
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {activeDayPlan.plan.map(({ slot, meal }) => (
                  <div key={`${activeDayPlan.day}-${slot}`} className="h-full rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <img
                      src={mealImageMap[meal.name] || "https://via.placeholder.com/400x225"}
                      alt={meal.name}
                      className="aspect-[16/9] w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-secondaryGreen">
                          {slotIcons[slot]} {slot}
                        </p>
                        <h4 className="text-lg font-semibold text-slate-100">{meal.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{meal.dietType}</p>
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
            <h2 className="text-2xl font-semibold text-blue-200">My Profile</h2>
            <p className="mt-2 text-slate-300">Set your household size and health goals.</p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>

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

              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Current Weight (kg)</span>
                <input
                  type="number"
                  min={0}
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>

              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Weight Goal (kg)</span>
                <input
                  type="number"
                  min={0}
                  value={weightGoal}
                  onChange={(e) => setWeightGoal(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                />
              </label>

              <label className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <span className="text-sm text-slate-300">Diet Type</span>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as DietType)}
                  className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 p-2 text-white"
                >
                  <option value="Mixed">Mixed (African)</option>
                  <option value="Vegan">Vegan (African)</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-xl border border-blue-900 bg-blue-950/40 p-4">
              <p className="text-sm text-slate-300">Total serving multiplier</p>
              <p className="text-3xl font-bold text-blue-200">{totalMealFactor.toFixed(1)}x</p>
              <p className="mt-2 text-sm text-slate-300">
                Example: {adults} adults and {children} child{children !== 1 ? "ren" : ""} equals{" "}
                <span className="font-semibold text-secondaryGreen">{totalMealFactor.toFixed(1)} portions</span> per meal.
              </p>
              <p className="mt-3 text-sm text-slate-300">
                <span className="font-semibold">Weight Progress:</span> {currentWeight}kg → {weightGoal}kg ({Math.round(currentWeight - weightGoal)}kg to lose)
              </p>
            </div>

            <button
              onClick={applyProfile}
              disabled={saving}
              className="mt-6 w-full rounded-lg bg-secondaryGreen px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : profileApplied ? "✓ Profile Applied" : "Apply Profile"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
