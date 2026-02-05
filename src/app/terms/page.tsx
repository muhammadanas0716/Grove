import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <main className="pl-16 pr-8 pt-16 pb-16 max-w-4xl">
        <h1
          className="text-5xl mb-8 tracking-tight"
          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
        >
          Terms of Service
        </h1>
        
        <div
          className="space-y-6 text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          <section>
            <h2 className="text-2xl mb-4 font-semibold">Acceptance of Terms</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              By accessing and using this service, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">Use License</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Permission is granted to temporarily use this service for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">User Accounts</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">Prohibited Uses</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              You may not use the service in any way that causes, or may cause, damage to the service 
              or impairment of the availability or accessibility of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-4 font-semibold">Limitation of Liability</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              In no event shall the service providers be liable for any damages arising out of the use 
              or inability to use the materials on this service.
            </p>
          </section>

          <div className="pt-8 border-t border-[var(--border)] mt-12">
            <p className="text-sm text-[var(--muted)]">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}
