export type MealSlot = "Breakfast" | "Lunch" | "Dinner";
export type DietType = "Mixed" | "Vegan";

export type Meal = {
  name: string;
  slot: MealSlot;
  area: "Lagos";
  calories: number;
  portion: string;
  weightLossFriendly: boolean;
  dietType: DietType;
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
    dietType: "Mixed",
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
    dietType: "Mixed",
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
    dietType: "Mixed",
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
    dietType: "Mixed",
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
    dietType: "Mixed",
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
    dietType: "Vegan",
    ingredients: ["Beans", "Plantain", "Onion", "Pepper", "Palm oil"],
    howToCook: [
      "Boil beans until soft.",
      "Cook with pepper and onion base until thick.",
      "Slice and fry or air-fry plantain; serve together."
    ]
  },
  {
    name: "Egg White Omelette and Whole Wheat Toast",
    slot: "Breakfast",
    area: "Lagos",
    calories: 280,
    portion: "3 egg white omelette + 2 slices whole wheat toast",
    weightLossFriendly: true,
    dietType: "Mixed",
    ingredients: ["Egg whites", "Whole wheat bread", "Tomato", "Onion", "Minimal oil"],
    howToCook: [
      "Whisk egg whites with diced tomato and onion.",
      "Cook in minimal oil until omelette is set.",
      "Serve with lightly toasted whole wheat bread."
    ]
  },
  {
    name: "Grilled Fish and Steamed Vegetables",
    slot: "Lunch",
    area: "Lagos",
    calories: 380,
    portion: "150g grilled fish + mixed steamed vegetables",
    weightLossFriendly: true,
    dietType: "Mixed",
    ingredients: ["Fresh fish", "Broccoli", "Green beans", "Carrot", "Lemon", "Herbs"],
    howToCook: [
      "Season fish with lemon and herbs.",
      "Grill over medium heat for 4-5 minutes per side.",
      "Steam vegetables until tender and serve alongside."
    ]
  },
  {
    name: "Vegetable Soup with Lean Chicken",
    slot: "Dinner",
    area: "Lagos",
    calories: 320,
    portion: "1.5 cups soup + 100g shredded chicken",
    weightLossFriendly: true,
    dietType: "Mixed",
    ingredients: ["Chicken breast", "Carrots", "Celery", "Leafy greens", "Stock", "Spices"],
    howToCook: [
      "Boil chicken breast in seasoned stock until cooked.",
      "Add chopped vegetables and simmer for 15 minutes.",
      "Shred chicken, return to soup, and simmer for 5 more minutes."
    ]
  },
  {
    name: "Akamu and Akara",
    slot: "Breakfast",
    area: "Lagos",
    calories: 450,
    portion: "1 cup akamu + 4 pieces akara",
    weightLossFriendly: false,
    dietType: "Vegan",
    ingredients: ["Corn flour", "Bean flour", "Onion", "Pepper", "Palm oil"],
    howToCook: [
      "Make smooth corn paste with water.",
      "Mix bean paste with pepper and onion.",
      "Deep fry akara until golden and serve with akamu."
    ]
  },
  {
    name: "Eba and Light Egusi Soup",
    slot: "Lunch",
    area: "Lagos",
    calories: 500,
    portion: "1 cup eba + 1 cup light egusi soup",
    weightLossFriendly: false,
    dietType: "Mixed",
    ingredients: ["Cassava granules", "Melon seeds", "Leafy greens", "Stock", "Lean meat"],
    howToCook: [
      "Make egusi soup base with melon and leafy greens.",
      "Add lean protein and simmer.",
      "Prepare eba by mixing cassava with hot stock and serve."
    ]
  },
  {
    name: "Okra Soup with Fufu",
    slot: "Dinner",
    area: "Lagos",
    calories: 480,
    portion: "1.5 cups okra soup + fufu",
    weightLossFriendly: false,
    dietType: "Mixed",
    ingredients: ["Fresh okra", "Fish", "Tomato", "Onion", "Plantain"],
    howToCook: [
      "Prepare fish and cook with mild seasoning.",
      "Add sliced okra and vegetables, cook until tender.",
      "Pound plantain and serve with soup."
    ]
  },
  {
    name: "Smoothie Bowl with Fruits",
    slot: "Breakfast",
    area: "Lagos",
    calories: 250,
    portion: "1 large bowl with granola and berries",
    weightLossFriendly: true,
    dietType: "Vegan",
    ingredients: ["Banana", "Berries", "Almond milk", "Granola", "Honey"],
    howToCook: [
      "Blend banana and berries with almond milk.",
      "Pour into bowl.",
      "Top with granola and fresh fruit."
    ]
  },
  {
    name: "Lentil and Vegetable Stew",
    slot: "Lunch",
    area: "Lagos",
    calories: 340,
    portion: "1.5 cups stew",
    weightLossFriendly: true,
    dietType: "Vegan",
    ingredients: ["Red lentils", "Carrot", "Celery", "Tomato", "Onion", "Herbs"],
    howToCook: [
      "Saute onion and aromatics.",
      "Add lentils and vegetables.",
      "Simmer until lentils are tender."
    ]
  },
  {
    name: "Roasted Vegetables and Quinoa",
    slot: "Dinner",
    area: "Lagos",
    calories: 300,
    portion: "1 cup quinoa + 2 cups roasted vegetables",
    weightLossFriendly: true,
    dietType: "Vegan",
    ingredients: ["Quinoa", "Broccoli", "Bell pepper", "Zucchini", "Olive oil", "Spices"],
    howToCook: [
      "Cook quinoa in vegetable stock.",
      "Toss vegetables with olive oil and spices.",
      "Roast at 400°F for 25 minutes until caramelized."
    ]
  }
];
