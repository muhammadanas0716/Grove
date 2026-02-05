import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <main className="pl-16 pr-8 pt-16 pb-16">
        {/* Hero Section */}
        <div className="mb-16">
          {/* Brand Name */}
          <h1
            className="text-[clamp(120px,18vw,220px)] leading-[0.85] tracking-[-0.03em] mb-12"
            style={{ fontFamily: 'var(--font-sans), sans-serif' }}
          >
            grove.
          </h1>

          {/* Tagline */}
          <div
            className="text-[clamp(24px,3.5vw,42px)] leading-[1.3] tracking-[-0.01em] mb-12"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <p className="text-[var(--foreground)]">Upload videos, photos, and articles.</p>
            <p className="text-[var(--accent)]">Get feedback. No bullshit.</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Pricing Button */}
            <a
              href="/subscribe"
              className="bg-[var(--accent)] text-[var(--background)] px-8 py-5 text-xl tracking-tight hover:bg-[var(--accent-hover)] transition-colors inline-block"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              <span className="font-semibold">$4.67</span>
              <span className="ml-3 font-normal opacity-80">unlimited seats</span>
            </a>

            {/* Trial Button */}
            <a
              href="/auth/signin"
              className="border border-[var(--foreground)] text-[var(--foreground)] px-8 py-5 text-xl tracking-tight hover:bg-[var(--foreground)]/10 transition-colors inline-block"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Start Free Trial →
            </a>
          </div>
        </div>

        {/* Feature Bar */}
        <div
          className="border-t border-[var(--border)] pt-8 grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <div className="border-r border-[var(--border)] pr-6 last:border-r-0">
            <p className="text-[var(--foreground)] font-medium text-base mb-1">Videos & photos</p>
            <p className="text-[var(--muted)] text-sm">Upload anything</p>
          </div>
          <div className="border-r border-[var(--border)] pr-6 md:border-r last:border-r-0">
            <p className="text-[var(--foreground)] font-medium text-base mb-1">Comments & articles</p>
            <p className="text-[var(--muted)] text-sm">Text feedback too</p>
          </div>
          <div className="border-r border-[var(--border)] pr-6 last:border-r-0">
            <p className="text-[var(--foreground)] font-medium text-base mb-1">Simple & fast</p>
            <p className="text-[var(--muted)] text-sm">No overkill</p>
          </div>
          <div>
            <p className="text-[var(--foreground)] font-medium text-base mb-1">Affordable</p>
            <p className="text-[var(--muted)] text-sm">Not expensive</p>
          </div>
        </div>
      </main>
    </div>
  );
}
