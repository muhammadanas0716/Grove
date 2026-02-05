import { ThemeToggle } from "@/components/theme-toggle";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <main className="pl-16 pr-8 pt-16 pb-16 max-w-4xl">
        <h1
          className="text-5xl mb-8 tracking-tight"
          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
        >
          Privacy Policy
        </h1>
        
        <div
          className="space-y-6 text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <section>
            <h2 className="text-2xl mb-4 font-semibold">Information We Collect</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, 
              upload content, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">How We Use Your Information</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">Data Security</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">Contact Us</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              If you have questions about this Privacy Policy, please contact us.
            </p>
          </section>

          <div className="pt-8 border-t border-[var(--border)] mt-12">
            <p className="text-sm text-[var(--muted)]">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
