import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { Polar } from "@polar-sh/sdk";

export const runtime = "nodejs";

type SuccessPageProps = {
  searchParams?: Promise<{
    checkoutId?: string;
  }>;
};

async function syncSubscriptionFromCheckout(
  checkoutId: string,
  userId: string,
) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!accessToken || !convexUrl) {
    return;
  }

  const polar = new Polar({
    accessToken,
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  });

  const checkout = await polar.checkouts.get({ id: checkoutId });
  if (checkout.status !== "succeeded") {
    return;
  }

  if (!checkout.customerId || !checkout.subscriptionId) {
    return;
  }

  let subscriptionStatus = "active";
  try {
    const subscription = await polar.subscriptions.get({
      id: checkout.subscriptionId,
    });
    subscriptionStatus = subscription.status;
  } catch (error) {
    console.error("Failed to load Polar subscription:", error);
  }

  const convex = new ConvexHttpClient(convexUrl);
  await convex.mutation(api.subscriptions.updateSubscription, {
    userId: userId as any,
    subscriptionStatus,
    polarCustomerId: checkout.customerId,
    subscriptionId: checkout.subscriptionId,
  });
}

export default async function SubscribeSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const checkoutId = resolvedSearchParams?.checkoutId;
  if (checkoutId && session.user?.id) {
    try {
      await syncSubscriptionFromCheckout(checkoutId, session.user.id);
    } catch (error) {
      console.error("Failed to sync subscription from checkout:", error);
    }
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
