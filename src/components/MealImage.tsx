import { type Meal } from "../data/meals";
import { mealImageMap } from "../data/mealImages";

export function MealImage({ meal }: { meal: Meal }) {
  const image = mealImageMap[meal.name];

  if (image?.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        className="aspect-[16/9] w-full rounded-lg object-cover"
        loading="lazy"
        onError={(e) => {
          // If the image fails to load, hide it so the fallback div shows instead
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="aspect-[16/9] w-full rounded-lg border border-slate-700 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_35%),linear-gradient(135deg,_#172033,_#0f172a_55%,_#1d4ed8)] p-4">
      <div className="flex h-full flex-col justify-between rounded-md border border-white/10 bg-black/10 p-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200/80">{meal.slot}</p>
        <div>
          <p className="text-xl font-bold text-white">{image?.fallbackLabel || meal.name}</p>
          <p className="mt-2 text-sm text-slate-200">{meal.ingredients.slice(0, 3).join(" • ")}</p>
        </div>
      </div>
    </div>
  );
}
