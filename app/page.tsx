import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-brass">
        Scent Studio
      </p>
      <h1 className="mb-4 font-serif text-4xl italic leading-tight text-ink md:text-5xl">
        Find Your Perfect Scent
      </h1>
      <p className="mb-12 max-w-sm text-sm leading-relaxed text-ink/60">
        A short, personal consultation to guide you to fragrances you'll
        genuinely love — from our current collection, in stock and ready.
      </p>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/quiz"
          className="group flex items-center justify-between rounded-sm border border-ink/10 bg-ink px-6 py-5 text-left shadow-soft transition-all duration-300 ease-silk hover:shadow-card"
        >
          <span>
            <span className="block font-serif text-lg italic text-ivory">Take the Scent Quiz</span>
            <span className="mt-1 block text-xs text-ivory/60">2 minutes · 10 quick questions</span>
          </span>
          <span className="text-brass-light transition-transform duration-300 ease-silk group-hover:translate-x-1">→</span>
        </Link>

        <Link
          href="/similar"
          className="group flex items-center justify-between rounded-sm border border-brass/30 bg-transparent px-6 py-5 text-left transition-all duration-300 ease-silk hover:border-brass hover:bg-beige/50"
        >
          <span>
            <span className="block font-serif text-lg italic text-ink">Find Something Similar</span>
            <span className="mt-1 block text-xs text-ink/50">Already have a favourite?</span>
          </span>
          <span className="text-brass transition-transform duration-300 ease-silk group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <p className="mt-16 text-[11px] uppercase tracking-widest text-ink/30">
        Hulhumalé Phase 2, Maldives
      </p>
    </main>
  );
}
