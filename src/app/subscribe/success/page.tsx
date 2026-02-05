import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SubscribeSuccessPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-8 page-transition">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
            Welcome to grove.
          </h1>
          <p className="text-[var(--muted)] text-lg" style={{ fontFamily: 'var(--font-mono), monospace' }}>
            Your subscription is now active. You can start using all features.
          </p>
        </div>

        <a
          href="/dashboard"
          className="inline-block bg-[var(--accent)] text-[var(--background)] px-8 py-4 text-lg font-medium tracking-tight hover:bg-[var(--accent-hover)] transition-colors"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
