export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-ink/40">
        <span>Question {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-brass transition-all duration-500 ease-silk"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
