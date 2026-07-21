import clsx from "clsx";

export default function OptionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "w-full rounded-sm border px-5 py-4 text-left text-sm transition-all duration-200 ease-silk active:scale-[0.98]",
        selected
          ? "border-brass bg-ink text-ivory shadow-card"
          : "border-ink/12 bg-white/40 text-ink hover:border-brass/50 hover:bg-beige/40"
      )}
    >
      <span className="flex items-center justify-between">
        {label}
        {selected && <span className="text-brass-light">✓</span>}
      </span>
    </button>
  );
}
