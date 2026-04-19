import { useState, useEffect, useCallback } from "react";
import { api, auth } from "../services/api";
import { useToast } from "./Toast";

interface SavedPlan {
  id?: string;
  _id?: string;
  planName: string;
  createdAt: string;
  meals: Array<{
    day: string;
    plan: Array<{
      slot: string;
      meal: { name: string; calories: number; portion: string };
    }>;
  }>;
}

function getPlanId(plan: SavedPlan): string {
  return plan.id || plan._id || "";
}

const slotIcons: Record<string, string> = {
  Breakfast: "🍳",
  Lunch: "🍲",
  Dinner: "🍽️",
};

export function SavedPlansTab() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPlans = useCallback(async () => {
    const token = auth.getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlans(token);
      if (Array.isArray(data)) {
        setPlans(data);
      } else {
        setError(data.error || "Failed to load plans.");
      }
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const deletePlan = useCallback(
    async (plan: SavedPlan) => {
      const id = getPlanId(plan);
      if (!id) return;
      setDeleting(id);
      const token = auth.getToken();
      if (!token) return;
      try {
        const result = await api.deletePlan(token, id);
        if (result.error) {
          showToast(result.error, "error");
        } else {
          setPlans((prev) => prev.filter((p) => getPlanId(p) !== id));
          showToast("Plan deleted.");
          if (expandedId === id) setExpandedId(null);
        }
      } catch {
        showToast("Failed to delete plan.", "error");
      } finally {
        setDeleting(null);
      }
    },
    [expandedId, showToast]
  );

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <section className="mt-6 glass rounded-2xl p-8 shadow-panel text-center">
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <p style={{ color: "#a8906a" }}>Loading your saved plans...</p>
      </section>
    );
  }

  return (
    <section className="mt-6 glass rounded-2xl p-6 shadow-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold gradient-text">Saved Plans</h2>
          <p className="mt-1 text-sm" style={{ color: "#a8906a" }}>
            {plans.length === 0
              ? "No saved plans yet."
              : `${plans.length} plan${plans.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        <button
          onClick={fetchPlans}
          className="rounded-xl px-4 py-2 text-sm font-bold transition"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c", cursor: "pointer" }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {plans.length === 0 && !error && (
        <div className="py-16 text-center">
          <p style={{ fontSize: 56, marginBottom: 12 }}>📋</p>
          <p className="text-lg font-semibold" style={{ color: "#a8906a" }}>No saved plans yet</p>
          <p className="text-sm mt-2" style={{ color: "#6b5a42" }}>
            Head to the Meal Planner and save a plan to see it here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {plans.map((plan) => {
          const id = getPlanId(plan);
          const isExpanded = expandedId === id;
          const isDeleting = deleting === id;

          return (
            <div
              key={id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: "rgba(10,6,2,0.6)",
                border: "1px solid rgba(249,115,22,0.2)",
                boxShadow: isExpanded ? "0 4px 20px rgba(249,115,22,0.1)" : "none",
              }}
            >
              {/* Plan header */}
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{plan.planName}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "#6b5a42" }}>
                    📅 {formatDate(plan.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold transition"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", color: "#f97316", cursor: "pointer" }}
                  >
                    {isExpanded ? "▲ Collapse" : "▼ View"}
                  </button>
                  <button
                    onClick={() => deletePlan(plan)}
                    disabled={isDeleting}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold transition"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1 }}
                  >
                    {isDeleting ? "..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>

              {/* Expanded plan details */}
              {isExpanded && Array.isArray(plan.meals) && (
                <div style={{ borderTop: "1px solid rgba(249,115,22,0.15)" }} className="p-4">
                  <div className="space-y-5">
                    {plan.meals.map((dayPlan) => (
                      <div key={dayPlan.day}>
                        <p className="mb-3 text-sm font-extrabold" style={{ color: "#fbbf24" }}>
                          📆 {dayPlan.day}
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {Array.isArray(dayPlan.plan) &&
                            dayPlan.plan.map(({ slot, meal }) => (
                              <div
                                key={slot}
                                className="rounded-xl p-3"
                                style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}
                              >
                                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#f97316" }}>
                                  {slotIcons[slot] || ""} {slot}
                                </p>
                                <p className="text-sm font-semibold text-white">{meal?.name}</p>
                                {meal?.calories && (
                                  <p className="mt-1 text-xs" style={{ color: "#6b5a42" }}>{meal.calories} kcal</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
