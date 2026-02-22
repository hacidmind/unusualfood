export type MealSlot = "Breakfast" | "Lunch" | "Dinner";

export type Meal = {
  name: string;
  slot: MealSlot;
  area: "Lagos";
  calories: number;
  portion: string;
  weightLossFriendly: boolean;
  ingredients: string[];
  howToCook: string[];
};

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export const meals: Meal[] = [
  {
    name: "Pap (Ogi) and Moi Moi",
    slot: "Breakfast",
    area: "Lagos",
    calories: 360,
    portion: "1 cup pap + 1 medium moi moi",
    weightLossFriendly: true,
    ingredients: ["Fermented maize pap", "Bean paste", "Pepper", "Onion", "Palm oil"],
    howToCook: [
      "Prepare smooth bean paste with pepper and onion.",
      "Season, add a small amount of oil, and steam in wraps for 35 minutes.",
      "Cook pap in hot water until thick and serve warm."
    ]
  },
  {
    name: "Yam and Egg Sauce",
    slot: "Breakfast",
    area: "Lagos",
    calories: 520,
    portion: "2 slices boiled yam + 1 egg sauce serving",
    weightLossFriendly: false,
    ingredients: ["Yam", "Eggs", "Tomato", "Pepper", "Onion"],
    howToCook: [
      "Boil yam chunks in salted water until tender.",
      "Saute onion, tomato, and pepper.",
      "Add whisked eggs, stir gently, and serve over yam."
    ]
  },
  {
    name: "Ofada Rice and Ayamase (Light)",
    slot: "Lunch",
    area: "Lagos",
    calories: 470,
    portion: "1 cup rice + 1/2 cup ayamase",
    weightLossFriendly: true,
    ingredients: ["Ofada rice", "Green pepper blend", "Onion", "Lean assorted protein"],
    howToCook: [
      "Parboil and cook ofada rice until soft.",
      "Cook pepper blend in reduced oil with onion.",
      "Add lean protein and simmer until flavors combine."
    ]
  },
  {
    name: "Jollof Rice and Grilled Chicken",
    slot: "Lunch",
    area: "Lagos",
    calories: 650,
    portion: "1.5 cups jollof + 1 chicken thigh",
    weightLossFriendly: false,
    ingredients: ["Rice", "Tomato blend", "Pepper", "Stock", "Chicken"],
    howToCook: [
      "Fry tomato-pepper base and season deeply.",
      "Add rice and stock, then cook covered until fluffy.",
      "Season chicken and grill until fully cooked."
    ]
  },
  {
    name: "Efo Riro with Fish and Small Swallow",
    slot: "Dinner",
    area: "Lagos",
    calories: 430,
    portion: "1 cup efo riro + small amala wrap",
    weightLossFriendly: true,
    ingredients: ["Spinach", "Pepper mix", "Onion", "Fish", "Palm oil"],
    howToCook: [
      "Cook pepper mix in a little oil.",
      "Add fish and seasoning, then simmer briefly.",
      "Fold in spinach and cook for 3 to 5 minutes."
    ]
  },
  {
    name: "Beans and Plantain",
    slot: "Dinner",
    area: "Lagos",
    calories: 560,
    portion: "1 cup beans + 1 medium plantain",
    weightLossFriendly: false,
    ingredients: ["Beans", "Plantain", "Onion", "Pepper", "Palm oil"],
    howToCook: [
      "Boil beans until soft.",
      "Cook with pepper and onion base until thick.",
      "Slice and fry or air-fry plantain; serve together."
    ]
  }
];
