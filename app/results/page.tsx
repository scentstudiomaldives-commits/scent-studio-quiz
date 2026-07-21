import { Suspense } from "react";
import ResultsClient from "./ResultsClient";

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6 text-sm text-ink/50">
          Preparing your scent profile…
        </main>
      }
    >
      <ResultsClient />
    </Suspense>
  );
}
