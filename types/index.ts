// ---------- Quiz domain ----------

export type Gender = "women" | "men" | "unisex" | "no_preference";

export type ScentFamily =
  | "fresh" | "citrus" | "aquatic" | "floral" | "fruity" | "sweet"
  | "vanilla" | "gourmand" | "woody" | "spicy" | "amber" | "musk"
  | "leather" | "tobacco" | "oud";

export type Occasion =
  | "everyday" | "office" | "date_night" | "evening_events"
  | "weddings_special" | "holiday" | "gift";

export type ClimateFit = "hot_daytime" | "warm_evening" | "ac_office" | "any_weather";

export type Strength = "light" | "moderate" | "strong" | "very_strong";

export type Mood =
  | "clean_refreshing" | "soft_romantic" | "elegant_sophisticated"
  | "sweet_playful" | "bold_seductive" | "dark_mysterious" | "luxurious_powerful";

export interface BudgetRange {
  id: string;
  label: string;
  min: number; // MVR, inclusive
  max: number | null; // null = no upper bound
  sort_order: number;
}

export interface QuizAnswers {
  gender: Gender | null;
  ageRange: string | null;
  scentFamilies: ScentFamily[];
  dislikedNotes: string[];
  occasions: Occasion[];
  climate: ClimateFit[];
  strength: Strength | null;
  mood: Mood | null;
  budgetRangeId: string | null;
  allowSlightlyHigherBudget: boolean;
  lovedPerfumeFreeText: string | null;
}

// ---------- Fragrance attributes (Supabase, mirrors Shopify metafields) ----------

export interface FragranceAttributes {
  product_id: string; // Shopify product GID
  scent_families: ScentFamily[];
  top_notes: string[];
  mid_notes: string[];
  base_notes: string[];
  occasions: Occasion[];
  mood: Mood | null;
  strength: Strength | null;
  longevity_hours: number | null;
  projection: "intimate" | "moderate" | "heavy" | null;
  climate_fit: ClimateFit[];
  gender_position: Gender;
  classification: "designer" | "niche" | null;
  is_featured: boolean;
  is_excluded: boolean;
}

// ---------- Shopify product (Storefront API) ----------

export interface ShopifyProduct {
  id: string; // gid://shopify/Product/...
  handle: string;
  title: string;
  vendor: string;
  descriptionHtml: string;
  productUrl: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  tags: string[];
  variantId: string; // first available variant GID, for Add to Cart
  availableForSale: boolean;
  totalInventory: number | null;
}

// ---------- Merged product ready for scoring/display ----------

export interface ScorableProduct extends ShopifyProduct {
  attrs: FragranceAttributes;
}

export interface ScoredProduct {
  product: ScorableProduct;
  score: number; // 0-100
  breakdown: {
    family: number;
    notes: number;
    occasion: number;
    mood: number;
    performance: number;
    climate: number;
    budget: number;
    penalty: number;
  };
  reason: string;
}

export interface ScoringWeights {
  family: number;
  notes: number;
  occasion: number;
  mood: number;
  performance: number;
  climate: number;
  budget: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  family: 25,
  notes: 20,
  occasion: 15,
  mood: 10,
  performance: 10,
  climate: 10,
  budget: 10,
};
