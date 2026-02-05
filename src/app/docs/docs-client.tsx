"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";

type PromptCard = {
  title: string;
  description: string;
  prompt: string;
};

const prompts: PromptCard[] = [
  {
    title: "Cursor Setup Prompt",
    description: "Use this in Cursor to bootstrap local setup fast.",
    prompt: `You are helping me set up the grove repo locally.
1) Install dependencies with npm.
2) Copy .env.local.example to .env.local.
3) Run "npx convex dev" and wait for the deployment values to be written.
4) Start the Next.js dev server on port 4000.
If POLAR_* variables are not set, mark my Convex user record subscriptionStatus as "active" so I can access the dashboard.
Confirm commands before running them.`,
  },
  {
    title: "Claude Code Prompt",
    description: "Paste this into Claude Code for an automated setup flow.",
    prompt: `Set up the grove project for local development.
Tasks:
- npm install
- cp .env.local.example .env.local
- npx convex dev (wait for env values)
- npm run dev (port 4000)
If billing env vars are missing, update my Convex user subscriptionStatus to "active" for local testing.
Report any errors with suggested fixes.`,
  },
  {
    title: "Generic Agent Prompt",
    description: "Works for Codex or any agent that can run terminal commands.",
    prompt: `Please bootstrap this Next.js + Convex app locally.
Steps:
1) npm install
2) cp .env.local.example .env.local
3) npx convex dev (wait until ready)
4) npm run dev (port 4000)
If Polar billing is not configured, set the current user's subscriptionStatus to "active" in Convex for local access.`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-[var(--border)] bg-[var(--surface-4)] px-4 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      style={{ fontFamily: "var(--font-mono), monospace" }}
    >
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}

export default function DocsClient() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] page-transition">
      <ThemeToggle />
      <main className="px-8 py-12">
        <header className="max-w-4xl">
          <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
            Documentation
          </p>
          <h1
            className="mt-3 text-[clamp(40px,5vw,72px)] leading-[1.05]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            grove docs
          </h1>
          <p
            className="mt-4 text-base text-[var(--muted)]"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            Self-hosting, setup, and integration notes for the open-source version. The hosted plan
            ships with billing and maintenance included.
          </p>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Quickstart (Local)
            </h2>
            <ol
              className="mt-4 space-y-3 text-sm text-[var(--muted)]"
              style={{ fontFamily: "var(--font-mono), monospace" }}
            >
              <li>1. Install deps: `npm install`</li>
              <li>2. Copy env: `cp .env.local.example .env.local`</li>
              <li>3. Start Convex: `npx convex dev`</li>
              <li>4. Run app: `npm run dev`</li>
            </ol>
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Local access without Polar
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                If you don’t configure billing, update your Convex user record and set
                `subscriptionStatus` to `active` or `trialing`.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Environment Variables
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  Required
                </p>
                <div className="mt-3 space-y-2 text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  <p>`AUTH_SECRET`</p>
                  <p>`NEXT_PUBLIC_CONVEX_URL`</p>
                  <p>`CONVEX_DEPLOYMENT`</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  Billing (optional)
                </p>
                <div className="mt-3 space-y-2 text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  <p>`POLAR_ACCESS_TOKEN`</p>
                  <p>`POLAR_WEBHOOK_SECRET`</p>
                  <p>`POLAR_PRODUCT_ID`</p>
                  <p>`POLAR_SERVER`</p>
                  <p>`POLAR_SUCCESS_URL`</p>
                  <p>`POLAR_RETURN_URL`</p>
                  <p>`NEXT_PUBLIC_APP_URL`</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl" style={{ fontFamily: "var(--font-display), serif" }}>
                AI Setup Prompts
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                Copy a prompt for Cursor, Claude Code, or any agent to run setup for you.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {prompts.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <h3 className="text-lg font-medium" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
                  {card.title}
                </h3>
                <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
                  {card.description}
                </p>
                <pre
                  className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-3)] p-3 text-xs text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {card.prompt}
                </pre>
                <div className="mt-4">
                  <CopyButton text={card.prompt} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Access Gating
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono), monospace" }}>
              The app enforces plan access. Users without an active plan or trial are redirected
              to `/subscribe`. Collaborators can view and leave notes but cannot upload.
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs">
              <p style={{ fontFamily: "var(--font-mono), monospace" }}>
                If you’re testing locally without billing, set `subscriptionStatus` to `active` or
                `trialing` in Convex.
              </p>
            </div>
          </div>
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Useful Commands
            </h2>
            <div className="mt-4 space-y-3 text-sm" style={{ fontFamily: "var(--font-mono), monospace" }}>
              <p>`npm run dev` — start Next.js</p>
              <p>`npx convex dev` — start Convex</p>
              <p>`npm run build` — production build</p>
              <p>`npm run convex:deploy` — deploy Convex</p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
