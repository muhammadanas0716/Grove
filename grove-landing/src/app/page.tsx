export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F0A08] text-[#F5E6D3]">
      <main className="px-4 pt-32 pb-16">
        {/* Hero Section */}
        <div className="mb-16">
          {/* Brand Name */}
          <h1
            className="text-[clamp(100px,16vw,200px)] leading-[0.9] tracking-[-0.02em] mb-10"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            grove
          </h1>

          {/* Tagline */}
          <div
            className="text-[clamp(20px,3vw,36px)] leading-[1.35] tracking-[-0.01em] mb-10"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            <p className="text-[#F5E6D3]">Design feedback for async teams.</p>
            <p className="text-[#F59E0B]">No meetings. No drama.</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Pricing Button */}
            <button
              className="bg-[#F59E0B] text-[#0F0A08] px-7 py-4 text-lg tracking-tight hover:bg-[#F7B547] transition-colors"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              <span className="font-semibold">$8/mo</span>
              <span className="ml-2 font-normal opacity-80">per workspace</span>
            </button>

            {/* Trial Button */}
            <button
              className="border border-[#F5E6D3] text-[#F5E6D3] px-7 py-4 text-lg tracking-tight hover:bg-[#F5E6D3]/10 transition-colors"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Start Free Trial →
            </button>
          </div>
        </div>

        {/* Feature Bar */}
        <div
          className="border-t border-[#3A2D24] pt-8 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <div className="pr-4">
            <p className="text-[#F5E6D3] font-medium text-sm mb-1">Async-first</p>
            <p className="text-[#A0866A] text-xs">Comments, not calls</p>
          </div>
          <div className="pr-4">
            <p className="text-[#F5E6D3] font-medium text-sm mb-1">Unlimited projects</p>
            <p className="text-[#A0866A] text-xs">One flat price</p>
          </div>
          <div className="pr-4">
            <p className="text-[#F5E6D3] font-medium text-sm mb-1">50ms sync</p>
            <p className="text-[#A0866A] text-xs">Real-time updates</p>
          </div>
          <div>
            <p className="text-[#F5E6D3] font-medium text-sm mb-1">Any format</p>
            <p className="text-[#A0866A] text-xs">Figma, PNG, PDF</p>
          </div>
        </div>
      </main>
    </div>
  );
}
