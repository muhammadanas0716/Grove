"use client";

export default function SubscribeClient() {
  const handleSubscribe = () => {
    window.location.href = "/api/polar/checkout";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-8 page-transition">
      <div className="max-w-md w-full">
        <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
          Subscribe
        </h1>
        <p className="text-[var(--muted)] text-lg mb-8" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          Get unlimited access to grove.
        </p>

        <div className="bg-[var(--border)] border border-[var(--border)] p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-baseline mb-2">
              <span className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                $4.67
              </span>
              <span className="text-[var(--muted)] ml-2" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                /month
              </span>
            </div>
            <p className="text-[var(--muted)] text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              Unlimited seats • Cancel anytime
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                ✓
              </span>
              <span className="text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                Upload videos, photos, and articles
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                ✓
              </span>
              <span className="text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                Unlimited team members
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                ✓
              </span>
              <span className="text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                Comments and feedback
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                ✓
              </span>
              <span className="text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                Real-time collaboration
              </span>
            </li>
          </ul>

          <button
            onClick={handleSubscribe}
            className="w-full bg-[var(--accent)] text-[var(--background)] px-8 py-4 text-lg font-medium tracking-tight hover:bg-[var(--accent-hover)] transition-colors"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}
