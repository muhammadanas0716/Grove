"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardClient({ userId }: { userId: string }) {
  const subscription = useQuery(api.subscriptions.getUserSubscription, {
    userId: userId as any,
  });

  const status = subscription?.subscriptionStatus || "inactive";
  const isActive = status === "active";
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/polar/sync", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync subscription");
      }
      setSyncMessage("Subscription synced from Polar.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sync subscription";
      setSyncMessage(message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <div className="pl-16 pr-8 pt-16 pb-16">
        <div className="max-w-4xl">
          <h1 className="text-5xl mb-8" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
            Dashboard
          </h1>

          <div className="bg-[var(--border)] border border-[var(--border)] p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                  Plan Status
                </h2>
                <p className="text-[var(--muted)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  Your current subscription plan
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded ${
                  isActive
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "bg-[var(--muted)]/20 text-[var(--muted)]"
                }`}
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                    Plan
                  </p>
                  <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                    {isActive ? "$4.67/month" : "No plan"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                    Status
                  </p>
                  <p className="text-lg font-medium capitalize" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                    {status}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center justify-center bg-[var(--accent)] text-[var(--background)] px-5 py-2 text-sm font-medium tracking-tight hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {syncing ? "Syncing..." : "Sync Now"}
                </button>
                {syncMessage && (
                  <span className="text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                    {syncMessage}
                  </span>
                )}
              </div>
            </div>

            {!isActive && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <a
                  href="/subscribe"
                  className="inline-block bg-[var(--accent)] text-[var(--background)] px-6 py-3 font-medium tracking-tight hover:bg-[var(--accent-hover)] transition-colors"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  Subscribe Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
