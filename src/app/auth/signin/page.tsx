"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(nextPath);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-8 page-transition">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
            {isSignUp ? "Sign up" : "Sign in"}
          </h1>
          <p className="text-[var(--muted)] text-lg" style={{ fontFamily: 'var(--font-mono), monospace' }}>
            {isSignUp ? "Create your grove. account" : "Welcome back to grove."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block mb-3 text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] px-5 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block mb-3 text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] px-5 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-3 text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] px-5 py-4 focus:outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-5 py-3 text-sm" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--background)] px-8 py-4 text-lg font-medium tracking-tight hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[var(--border)]">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
