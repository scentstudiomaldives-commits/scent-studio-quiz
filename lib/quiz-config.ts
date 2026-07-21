import { getSupabaseClient } from "./supabase";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestionConfig {
  key: string;
  label: string;
  type: "single_select" | "multi_select" | "text";
  optional: boolean;
  options?: QuizOption[];
}

/**
 * Default question set (matches the original brief exactly). This is the
 * fallback used whenever the `quiz_questions` / `quiz_options` Supabase
 * tables are empty — so the quiz works immediately after deploy, before
 * anyone has touched the admin panel. Once an admin edits questions in
 * Admin → Quiz Config, those rows take over.
 */
export const DEFAULT_QUESTIONS: QuizQuestionConfig[] = [
  {
    key: "gender",
    label: "Who is the perfume for?",
    type: "single_select",
    optional: false,
    options: [
      { value: "women", label: "Women" },
      { value: "men", label: "Men" },
      { value: "unisex", label: "Unisex" },
      { value: "no_preference", label: "No preference" },
    ],
  },
  {
    key: "ageRange",
    label: "What age range are you shopping for?",
    type: "single_select",
    optional: false,
    options: [
      { value: "under_20", label: "Under 20" },
      { value: "20_29", label: "20–29" },
      { value: "30_39", label: "30–39" },
      { value: "40_49", label: "40–49" },
      { value: "50_plus", label: "50+" },
    ],
  },
  {
    key: "scentFamilies",
    label: "Which scent families do you prefer?",
    type: "multi_select",
    optional: false,
    options: [
      "fresh", "citrus", "aquatic", "floral", "fruity", "sweet", "vanilla",
      "gourmand", "woody", "spicy", "amber", "musk", "leather", "tobacco", "oud",
    ].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
  },
  {
    key: "dislikedNotes",
    label: "Any notes you'd like to avoid?",
    type: "multi_select",
    optional: true,
    options: [
      { value: "none", label: "None" },
      { value: "oud", label: "Oud" },
      { value: "tobacco", label: "Tobacco" },
      { value: "patchouli", label: "Patchouli" },
      { value: "vanilla", label: "Vanilla" },
      { value: "musk", label: "Musk" },
      { value: "rose", label: "Rose" },
      { value: "jasmine", label: "Jasmine" },
      { value: "leather", label: "Leather" },
      { value: "amber", label: "Amber" },
    ],
  },
  {
    key: "occasions",
    label: "When will you wear it?",
    type: "multi_select",
    optional: false,
    options: [
      { value: "everyday", label: "Everyday" },
      { value: "office", label: "Office" },
      { value: "date_night", label: "Date night" },
      { value: "evening_events", label: "Evening events" },
      { value: "weddings_special", label: "Weddings & special occasions" },
      { value: "holiday", label: "Holiday" },
      { value: "gift", label: "Gift" },
    ],
  },
  {
    key: "climate",
    label: "What weather should it suit?",
    type: "multi_select",
    optional: false,
    options: [
      { value: "hot_daytime", label: "Hot daytime" },
      { value: "warm_evening", label: "Warm evening" },
      { value: "ac_office", label: "Air-conditioned office" },
      { value: "any_weather", label: "Any weather" },
    ],
  },
  {
    key: "strength",
    label: "What performance do you prefer?",
    type: "single_select",
    optional: false,
    options: [
      { value: "light", label: "Light and subtle" },
      { value: "moderate", label: "Moderate" },
      { value: "strong", label: "Strong" },
      { value: "very_strong", label: "Very strong and long-lasting" },
    ],
  },
  {
    key: "mood",
    label: "What mood should the fragrance create?",
    type: "single_select",
    optional: false,
    options: [
      { value: "clean_refreshing", label: "Clean and refreshing" },
      { value: "soft_romantic", label: "Soft and romantic" },
      { value: "elegant_sophisticated", label: "Elegant and sophisticated" },
      { value: "sweet_playful", label: "Sweet and playful" },
      { value: "bold_seductive", label: "Bold and seductive" },
      { value: "dark_mysterious", label: "Dark and mysterious" },
      { value: "luxurious_powerful", label: "Luxurious and powerful" },
    ],
  },
  {
    key: "budgetRangeId",
    label: "What's your budget?",
    type: "single_select",
    optional: false,
    // options populated at runtime from the budget_ranges table
  },
  {
    key: "lovedPerfumeFreeText",
    label: "Do you have a perfume you already love?",
    type: "text",
    optional: true,
  },
];

/** Loads admin-configured questions from Supabase, falling back to defaults. */
export async function getQuizQuestions(): Promise<QuizQuestionConfig[]> {
  try {
    const supabase = getSupabaseClient();
    const { data: questions, error } = await supabase
      .from("quiz_questions")
      .select("*, quiz_options(*)")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !questions || questions.length === 0) return DEFAULT_QUESTIONS;

    return questions.map((q: any) => ({
      key: q.key,
      label: q.label,
      type: q.question_type,
      optional: q.is_optional,
      options: (q.quiz_options ?? [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((o: any) => ({ value: o.value, label: o.label })),
    }));
  } catch {
    return DEFAULT_QUESTIONS;
  }
}
