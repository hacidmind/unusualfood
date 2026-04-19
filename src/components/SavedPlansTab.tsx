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

const slotIcons: Record<string, string> = { Breakfast: "🍳", Lunch: "🍲", Dinner: "🍽️" };

const slotColors: Record<string, { bg: string; color: string }> = {
  Breakfast: { bg: "#FFF7ED", color: "#EA580C" },
  Lunch:     { bg: "#F0FDF4", color: "#15803D" },
  Dinner:    { bg: "#FEF3C7", color: "#B45309" },
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
      if (Array.isArray(data)) setPlans(data);
      else setError(data.error || "Failed to load plans.");
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const deletePlan = useCallback(async (plan: SavedPlan) => {
    const id = getPlanId(plan);
    if (!id) return;
    setDeleting(id);
    const token = auth.getToken();
    if (!token) return;
    try {
      const result = await api.deletePlan(token, id);
      if (result.error) showToast(result.error, "error");
      else {
        setPlans((prev) => prev.filter((p) => getPlanId(p) !== id));
        showToast("Plan deleted.");
        if (expandedId === id) setExpandedId(null);
      }
    } catch {
      showToast("Failed to delete plan.", "error");
    } finally {
      setDeleting(null);
    }
  }, [expandedId, showToast]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
        <p style={{ color: "var(--text-2)", margin: 0 }}>Loading your saved plans…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>Saved Plans</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-3)" }}>
              {plans.length === 0 ? "No saved plans yet." : `${plans.length} plan${plans.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <button onClick={fetchPlans} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>🔄 Refresh</button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 14 }}>
            {error}
          </div>
        )}

        {plans.length === 0 && !error && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontSize: 52, margin: "0 0 12px" }}>📋</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>No saved plans yet</p>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Save a meal plan from the Planner tab to see it here.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {plans.map((plan) => {
            const id = getPlanId(plan);
            const isExpanded = expandedId === id;
            const isDeleting = deleting === id;

            return (
              <div key={id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: isExpanded ? "var(--shadow-md)" : "var(--shadow-sm)" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", background: "var(--bg-card)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{plan.planName}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-3)" }}>📅 {formatDate(plan.createdAt)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit", border: "1px solid var(--green)", background: isExpanded ? "var(--green)" : "transparent",
                        color: isExpanded ? "#fff" : "var(--green)", transition: "all 0.2s",
                      }}
                    >
                      {isExpanded ? "▲ Collapse" : "▼ View"}
                    </button>
                    <button
                      onClick={() => deletePlan(plan)}
                      disabled={isDeleting}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: isDeleting ? "not-allowed" : "pointer",
                        fontFamily: "inherit", border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)",
                        color: "var(--red)", opacity: isDeleting ? 0.5 : 1, transition: "all 0.2s",
                      }}
                    >
                      {isDeleting ? "…" : "🗑️ Delete"}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && Array.isArray(plan.meals) && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "var(--bg-card-2)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {plan.meals.map((dayPlan) => (
                        <div key={dayPlan.day}>
                          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            📆 {dayPlan.day}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                            {Array.isArray(dayPlan.plan) && dayPlan.plan.map(({ slot, meal }) => {
                              const sc = slotColors[slot] || { bg: "var(--bg-card-2)", color: "var(--text-2)" };
                              return (
                                <div key={slot} style={{ background: sc.bg, border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: sc.color, letterSpacing: "0.5px" }}>
                                    {slotIcons[slot] || ""} {slot}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{meal?.name}</p>
                                  {meal?.calories && <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-3)" }}>{meal.calories} kcal</p>}
                                </div>
                              );
                            })}
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
      </div>
    </div>
  );
}
