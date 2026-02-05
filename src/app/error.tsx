"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition flex items-center justify-center">
      <ThemeToggle />
      <main className="text-center px-8">
        <h1
          className="text-[clamp(80px,12vw,160px)] leading-[0.9] tracking-[-0.03em] mb-8"
          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
        >
          500
        </h1>
        
        <div
          className="mb-12"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <p className="text-2xl mb-4 text-[var(--foreground)]">Something went wrong</p>
          <p className="text-[var(--muted)]">An error occurred while processing your request.</p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={reset}
            className="border border-[var(--foreground)] text-[var(--foreground)] px-8 py-4 text-lg tracking-tight hover:bg-[var(--foreground)]/10 transition-colors"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-block border border-[var(--foreground)] text-[var(--foreground)] px-8 py-4 text-lg tracking-tight hover:bg-[var(--foreground)]/10 transition-colors"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            Go home →
          </Link>
        </div>
      </main>
    </div>
  );
}
