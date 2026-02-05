import { Polar } from "@polar-sh/sdk";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const DEFAULT_APP_URL = "http://localhost:4000";

export const runtime = "nodejs";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(url);
}

function parseProductList(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function collectProductIds(req: NextRequest): string[] {
  const searchParams = req.nextUrl.searchParams;
  const queryProducts = searchParams
    .getAll("products")
    .flatMap((value) => parseProductList(value));
  if (queryProducts.length > 0) {
    return queryProducts;
  }

  const legacyProductId =
    searchParams.get("product_id") || searchParams.get("productId");
  const legacyProducts = parseProductList(legacyProductId);
  if (legacyProducts.length > 0) {
    return legacyProducts;
  }

  return parseProductList(process.env.POLAR_PRODUCT_ID || "");
}

function ensureCheckoutIdParam(url: string): string {
  const successUrl = new URL(url);
  if (!successUrl.searchParams.has("checkoutId")) {
    successUrl.searchParams.set("checkoutId", "{CHECKOUT_ID}");
  }
  return successUrl.toString();
}

function toAbsoluteUrl(pathOrUrl: string, appUrl: string): string {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl, appUrl).toString();
  }
}

export const GET = async (req: NextRequest) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "POLAR_ACCESS_TOKEN is not set" },
      { status: 500 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = collectProductIds(req);
  if (products.length === 0) {
    return NextResponse.json(
      {
        error:
          "POLAR_PRODUCT_ID is not set and no products query params were provided",
      },
      { status: 500 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || DEFAULT_APP_URL;
  const successUrl = toAbsoluteUrl(
    process.env.POLAR_SUCCESS_URL || "/subscribe/success",
    appUrl,
  );
  const returnUrl = toAbsoluteUrl(
    process.env.POLAR_RETURN_URL || "/subscribe",
    appUrl,
  );

  const polar = new Polar({
    accessToken,
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  });

  let polarCustomerId: string | null = null;
  try {
    const convex = getConvexClient();
    const user = await convex.query(api.auth.getUserById, {
      id: session.user.id as any,
    });
    polarCustomerId = user?.polarCustomerId ?? null;
  } catch (error) {
    console.error("Error loading user for Polar checkout:", error);
  }

  try {
    const checkout = await polar.checkouts.create({
      products,
      successUrl: ensureCheckoutIdParam(successUrl),
      returnUrl,
      customerId: polarCustomerId || undefined,
      externalCustomerId: polarCustomerId ? undefined : session.user.id,
      customerEmail: session.user.email || undefined,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.redirect(checkout.url);
  } catch (error) {
    console.error("Error creating Polar checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
};
