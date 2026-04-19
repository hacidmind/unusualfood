export type MealImageMeta = {
  src?: string;
  alt: string;
  fallbackLabel: string;
};

export const mealImageMap: Record<string, MealImageMeta> = {
  "Pap (Ogi) and Moi Moi": {
    src: "/images/pap_and_moi_moi.jpg",
    alt: "Pap with moi moi",
    fallbackLabel: "Pap + Moi Moi"
  },
  "Yam and Egg Sauce": {
    src: "/images/yam_and_egg_sauce.jpg",
    alt: "Boiled yam with egg sauce",
    fallbackLabel: "Yam + Egg Sauce"
  },
  "Ofada Rice and Ayamase (Light)": {
    src: "/images/ofada_rice_and_ayamase.jpg",
    alt: "Ofada rice with ayamase stew",
    fallbackLabel: "Ofada + Ayamase"
  },
  "Jollof Rice and Grilled Chicken": {
    src: "/images/jollof-rice-grilled-chicken-pinterest.jpg",
    alt: "Jollof rice with grilled chicken",
    fallbackLabel: "Jollof + Chicken"
  },
  "Efo Riro with Fish and Small Swallow": {
    src: "/images/efo_riro_with_fish_and_swallow.jpg",
    alt: "Efo riro with fish and swallow",
    fallbackLabel: "Efo Riro"
  },
  "Beans and Plantain": {
    src: "/images/beans_and_plantain.jpg",
    alt: "Beans served with fried plantain",
    fallbackLabel: "Beans + Plantain"
  },
  "Egg White Omelette and Whole Wheat Toast": {
    src: "/images/egg_white_omelette_whole_wheat_toast.jpg",
    alt: "Egg white omelette with toast",
    fallbackLabel: "Omelette + Toast"
  },
  "Grilled Fish and Steamed Vegetables": {
    alt: "Grilled fish with steamed vegetables",
    fallbackLabel: "Grilled Fish"
  },
  "Vegetable Soup with Lean Chicken": {
    src: "/images/vegetable_soup_with_lean_chicken.jpg",
    alt: "Vegetable soup with lean chicken",
    fallbackLabel: "Vegetable Soup"
  },
  "Pap and Akara": {
    src: "/images/pap_and_akara.jpeg",
    alt: "Pap served with akara",
    fallbackLabel: "Pap + Akara"
  },
  "Eba and Light Egusi Soup": {
    src: "/images/eba_and_egusi_soup.jpg",
    alt: "Eba with light egusi soup",
    fallbackLabel: "Eba + Egusi"
  },
  "Okra Soup with Fufu": {
    src: "/images/okra_soup_with_fufu.webp",
    alt: "Okra soup with fufu",
    fallbackLabel: "Okra + Fufu"
  },
  "Smoothie Bowl with Fruits": {
    src: "/images/smoothie_bowl_with_fruits.jpg",
    alt: "Smoothie bowl topped with fruits",
    fallbackLabel: "Smoothie Bowl"
  },
  "Nigerian Pepper Soup": {
    src: "/images/nigerian_pepper_soup.jpg",
    alt: "Nigerian pepper soup",
    fallbackLabel: "Pepper Soup"
  },
  "Pepper Rice and Beef": {
    src: "/images/pepper_rice_and_beef.jpg",
    alt: "Pepper rice served with beef",
    fallbackLabel: "Pepper Rice"
  }
};
