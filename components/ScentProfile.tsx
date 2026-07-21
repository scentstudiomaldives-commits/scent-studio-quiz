import type { QuizAnswers } from "@/types";

export default function ScentProfile({ answers }: { answers: QuizAnswers }) {
  const tags = [
    ...answers.scentFamilies,
    answers.mood?.replace(/_/g, " "),
    answers.strength?.replace(/_/g, " "),
    ...answers.occasions.slice(0, 2).map((o) => o.replace(/_/g, " ")),
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-sm border border-brass/30 bg-beige/40 p-6">
      <p className="mb-2 text-[11px] uppercase tracking-widest text-brass">Your Scent Profile</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-ink/10 bg-ivory px-3 py-1 text-xs capitalize text-ink/70"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
