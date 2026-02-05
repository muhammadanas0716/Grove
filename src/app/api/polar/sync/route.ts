import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { Polar } from "@polar-sh/sdk";

export const runtime = "nodejs";

function parseProductList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildProductFilter() {
  const products = parseProductList(process.env.POLAR_PRODUCT_ID);
  if (products.length === 0) {
    return undefined;
  }
  return products.length === 1 ? products[0] : products;
}

async function findCustomerIdByEmail(polar: Polar, email: string | null | undefined) {
  if (!email) return null;
  const page = await polar.customers.list({ email, limit: 1 });
  return page.result.items[0]?.id ?? null;
}

async function findLatestSubscription(
  polar: Polar,
  {
    customerId,
    externalCustomerId,
    productId,
  }: {
    customerId?: string | null;
    externalCustomerId?: string | null;
    productId?: string | string[];
  },
) {
  const base = {
    limit: 1,
    sorting: ["-started_at"] as any,
    ...(productId ? { productId } : {}),
  };

  if (customerId) {
    const activePage = await polar.subscriptions.list({
      ...base,
      customerId,
      active: true,
    });
    if (activePage.result.items[0]) return activePage.result.items[0];

    const anyPage = await polar.subscriptions.list({
      ...base,
      customerId,
    });
    return anyPage.result.items[0] ?? null;
  }

  if (externalCustomerId) {
    const activePage = await polar.subscriptions.list({
      ...base,
      externalCustomerId,
      active: true,
    });
    if (activePage.result.items[0]) return activePage.result.items[0];

    const anyPage = await polar.subscriptions.list({
      ...base,
      externalCustomerId,
    });
    return anyPage.result.items[0] ?? null;
  }

  return null;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL is not set" },
      { status: 500 },
    );
  }
  if (!accessToken) {
    return NextResponse.json(
      { error: "POLAR_ACCESS_TOKEN is not set" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const user = await convex.query(api.auth.getUserById, {
    id: session.user.id as any,
  });

  const polar = new Polar({
    accessToken,
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  });

  const productId = buildProductFilter();
  const existingCustomerId = user?.polarCustomerId ?? null;

  let subscription = await findLatestSubscription(polar, {
    customerId: existingCustomerId,
    externalCustomerId: session.user.id,
    productId,
  });

  let customerId = existingCustomerId;
  if (!subscription && session.user.email) {
    const emailCustomerId = await findCustomerIdByEmail(
      polar,
      session.user.email,
    );
    if (emailCustomerId) {
      customerId = emailCustomerId;
      subscription = await findLatestSubscription(polar, {
        customerId,
        productId,
      });
    }
  }

  if (!subscription || !subscription.customerId) {
    return NextResponse.json(
      { error: "No Polar subscription found for this user." },
      { status: 404 },
    );
  }

  await convex.mutation(api.subscriptions.updateSubscription, {
    userId: session.user.id as any,
    subscriptionStatus: subscription.status,
    polarCustomerId: subscription.customerId,
    subscriptionId: subscription.id,
  });

  return NextResponse.json({
    ok: true,
    subscriptionStatus: subscription.status,
    subscriptionId: subscription.id,
    polarCustomerId: subscription.customerId,
  });
}
