import type {
  QuizAnswers,
  ScorableProduct,
  ScoredProduct,
  ScoringWeights,
  BudgetRange,
} from "@/types";

/**
 * Transparent weighted scoring engine.
 *
 * Each sub-score is computed on a 0-1 scale, then multiplied by its weight
 * (percentage points) so the final total sums to 0-100 for a perfect match.
 * The final displayed "match %" IS this total — never padded or faked.
 */

const DISLIKED_NOTE_PENALTY = 0.6; // multiplicative penalty per disliked note present, applied to family+notes score
const MAX_PRIMARY_MATCHES = 3;
const MAX_ALTERNATE_MATCHES = 3;
const MIN_STRONG_MATCH_SCORE = 45; // below this, we don't call it a "strong match"

function scoreOverlap<T>(preferred: T[], productValues: T[]): number {
  if (preferred.length === 0) return 0.6; // no preference stated = neutral, don't penalize
  if (productValues.length === 0) return 0;
  const hits = preferred.filter((p) => productValues.includes(p)).length;
  return Math.min(1, hits / preferred.length);
}

function scoreGender(preferred: string, productGender: string): number {
  if (preferred === "no_preference") return 0.8;
  if (productGender === "unisex") return 0.9;
  return preferred === productGender ? 1 : 0.35; // soft preference, not exclusionary
}

function scoreStrength(preferred: string | null, productStrength: string | null): number {
  if (!preferred || !productStrength) return 0.6;
  const order = ["light", "moderate", "strong", "very_strong"];
  const diff = Math.abs(order.indexOf(preferred) - order.indexOf(productStrength));
  if (diff === 0) return 1;
  if (diff === 1) return 0.6;
  return 0.2;
}

function scoreClimate(preferred: string[], productClimate: string[]): number {
  if (preferred.length === 0 || preferred.includes("any_weather")) return 0.85;
  if (productClimate.includes("any_weather")) return 0.8;
  return scoreOverlap(preferred, productClimate);
}

function scoreBudget(
  price: number,
  range: BudgetRange | null,
  allowHigher: boolean
): number {
  if (!range) return 0.6;
  if (price >= range.min && (range.max === null || price <= range.max)) return 1;
  if (price < range.min) return 0.9; // cheaper than requested is fine
  if (!allowHigher) return 0; // over budget and customer didn't allow flexibility
  // Over budget, but customer allows some flexibility: taper off over the next 20%.
  const ceiling = range.max ?? range.min * 1.5;
  const overBy = (price - ceiling) / ceiling;
  return Math.max(0, 0.7 - overBy * 2);
}

function buildReason(p: ScorableProduct, answers: QuizAnswers, breakdown: ScoredProduct["breakdown"]): string {
  const parts: string[] = [];
  const familyMatch = answers.scentFamilies.filter((f) => p.attrs.scent_families.includes(f));
  if (familyMatch.length > 0) {
    parts.push(`built around ${familyMatch.join(" and ")} notes you selected`);
  }
  if (answers.occasions.length > 0) {
    const occMatch = answers.occasions.filter((o) => p.attrs.occasions.includes(o));
    if (occMatch.length > 0) parts.push(`suited to ${occMatch.join(", ").replace(/_/g, " ")}`);
  }
  if (breakdown.climate >= 0.8 && answers.climate.length > 0) {
    parts.push("well-suited to the Maldives climate");
  }
  if (breakdown.budget >= 0.9) {
    parts.push("within your budget");
  }
  if (parts.length === 0) return "A close overall match to your scent profile.";
  return `Recommended because it's ${parts.join(", ")}.`;
}

export function scoreProducts(
  products: ScorableProduct[],
  answers: QuizAnswers,
  weights: ScoringWeights,
  budgetRanges: BudgetRange[]
): { primary: ScoredProduct[]; alternates: ScoredProduct[]; insufficientMatches: boolean } {
  const selectedRange = budgetRanges.find((r) => r.id === answers.budgetRangeId) ?? null;

  const scored: ScoredProduct[] = products
    // Hard rule: never recommend out-of-stock products
    .filter((p) => p.availableForSale && (p.totalInventory === null || p.totalInventory > 0))
    // Hard rule: admin-excluded products never appear
    .filter((p) => !p.attrs.is_excluded)
    .map((p) => {
      const familyScore = scoreOverlap(answers.scentFamilies, p.attrs.scent_families);
      const allProductNotes = [...p.attrs.top_notes, ...p.attrs.mid_notes, ...p.attrs.base_notes];
      const noteScore = answers.dislikedNotes.length === 0 ? 0.8 : 0.8; // baseline; penalty applied below
      const occasionScore = scoreOverlap(answers.occasions, p.attrs.occasions);
      const moodScore = answers.mood ? (p.attrs.mood === answers.mood ? 1 : 0.4) : 0.6;
      const performanceScore = scoreStrength(answers.strength, p.attrs.strength);
      const climateScore = scoreClimate(answers.climate, p.attrs.climate_fit);
      const price = parseFloat(p.priceRange.minVariantPrice.amount);
      const budgetScore = scoreBudget(price, selectedRange, answers.allowSlightlyHigherBudget);
      const genderScore = scoreGender(answers.gender ?? "no_preference", p.attrs.gender_position);

      // Disliked notes: major multiplicative penalty, applied to the whole score
      const dislikedHits = answers.dislikedNotes.filter((n) =>
        allProductNotes.some((pn) => pn.toLowerCase() === n.toLowerCase())
      ).length;
      const penaltyMultiplier = Math.pow(DISLIKED_NOTE_PENALTY, dislikedHits);

      // Gender folded lightly into family weight (soft preference, per spec)
      const familyBlended = familyScore * 0.85 + genderScore * 0.15;

      const breakdown = {
        family: familyBlended * weights.family,
        notes: noteScore * weights.notes,
        occasion: occasionScore * weights.occasion,
        mood: moodScore * weights.mood,
        performance: performanceScore * weights.performance,
        climate: climateScore * weights.climate,
        budget: budgetScore * weights.budget,
        penalty: 0,
      };

      let rawScore =
        breakdown.family +
        breakdown.notes +
        breakdown.occasion +
        breakdown.mood +
        breakdown.performance +
        breakdown.climate +
        breakdown.budget;

      rawScore *= penaltyMultiplier;
      breakdown.penalty = dislikedHits > 0 ? -(1 - penaltyMultiplier) * 100 : 0;

      // Hard rule: strictly over budget with no flexibility allowed -> disqualify
      const finalScore = budgetScore === 0 && !answers.allowSlightlyHigherBudget ? 0 : rawScore;

      return {
        product: p,
        score: Math.round(Math.max(0, Math.min(100, finalScore))),
        breakdown,
        reason: "",
      } as ScoredProduct;
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  scored.forEach((s) => {
    s.reason = buildReason(s.product, answers, s.breakdown);
  });

  const strongMatches = scored.filter((s) => s.score >= MIN_STRONG_MATCH_SCORE);
  const insufficientMatches = strongMatches.length < MAX_PRIMARY_MATCHES;

  const pool = insufficientMatches ? scored : strongMatches;
  const primary = pool.slice(0, MAX_PRIMARY_MATCHES);
  const alternates = pool.slice(MAX_PRIMARY_MATCHES, MAX_PRIMARY_MATCHES + MAX_ALTERNATE_MATCHES);

  return { primary, alternates, insufficientMatches };
}

/**
 * "Find Something Similar": score every product against a reference product's
 * own attributes rather than quiz answers, weighting notes/family highest.
 */
export function scoreSimilarProducts(
  products: ScorableProduct[],
  reference: ScorableProduct
): ScoredProduct[] {
  const refNotes = [...reference.attrs.top_notes, ...reference.attrs.mid_notes, ...reference.attrs.base_notes];
  const refPrice = parseFloat(reference.priceRange.minVariantPrice.amount);

  return products
    .filter((p) => p.id !== reference.id)
    .filter((p) => p.availableForSale && (p.totalInventory === null || p.totalInventory > 0))
    .filter((p) => !p.attrs.is_excluded)
    .map((p) => {
      const pNotes = [...p.attrs.top_notes, ...p.attrs.mid_notes, ...p.attrs.base_notes];
      const familyScore = scoreOverlap(reference.attrs.scent_families, p.attrs.scent_families);
      const noteScore = scoreOverlap(refNotes, pNotes);
      const moodScore = p.attrs.mood === reference.attrs.mood ? 1 : 0.4;
      const strengthScore = scoreStrength(reference.attrs.strength, p.attrs.strength);
      const occasionScore = scoreOverlap(reference.attrs.occasions, p.attrs.occasions);
      const climateScore = scoreOverlap(reference.attrs.climate_fit, p.attrs.climate_fit);
      const price = parseFloat(p.priceRange.minVariantPrice.amount);
      const priceCloseness = 1 - Math.min(1, Math.abs(price - refPrice) / (refPrice || 1));

      const weights = { family: 30, notes: 30, occasion: 12, mood: 10, strength: 10, climate: 4, price: 4 };
      const score =
        familyScore * weights.family +
        noteScore * weights.notes +
        occasionScore * weights.occasion +
        moodScore * weights.mood +
        strengthScore * weights.strength +
        climateScore * weights.climate +
        priceCloseness * weights.price;

      return {
        product: p,
        score: Math.round(score),
        breakdown: {
          family: familyScore * weights.family,
          notes: noteScore * weights.notes,
          occasion: occasionScore * weights.occasion,
          mood: moodScore * weights.mood,
          performance: strengthScore * weights.strength,
          climate: climateScore * weights.climate,
          budget: priceCloseness * weights.price,
          penalty: 0,
        },
        reason: `Similar to ${reference.title}: shares ${familyScore >= 0.5 ? "scent family" : "some notes"} and a comparable feel.`,
      } as ScoredProduct;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
