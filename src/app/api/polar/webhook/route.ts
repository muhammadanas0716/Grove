import { ConvexHttpClient } from "convex/browser";
import { Webhooks } from "@polar-sh/nextjs";
import { api } from "convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ResolveUserArgs = {
  customerId?: string | null;
  customerExternalId?: string | null;
  customerEmail?: string | null;
};

async function getUserById(
  convex: ConvexHttpClient,
  id: string | null | undefined,
) {
  if (!id) {
    return null;
  }
  try {
    return await convex.query(api.auth.getUserById, { id: id as any });
  } catch (error) {
    console.error("Polar webhook: failed to query user by id", error);
    return null;
  }
}

async function getUserByPolarCustomer(
  convex: ConvexHttpClient,
  customerId: string | null | undefined,
) {
  if (!customerId) {
    return null;
  }
  try {
    return await convex.query(api.subscriptions.getUserByPolarCustomer, {
      polarCustomerId: customerId,
    });
  } catch (error) {
    console.error("Polar webhook: failed to query user by customer id", error);
    return null;
  }
}

async function getUserByEmail(
  convex: ConvexHttpClient,
  email: string | null | undefined,
) {
  if (!email) {
    return null;
  }
  try {
    return await convex.query(api.auth.getUserByEmail, { email });
  } catch (error) {
    console.error("Polar webhook: failed to query user by email", error);
    return null;
  }
}

async function resolveUser(
  convex: ConvexHttpClient,
  {
  customerId,
  customerExternalId,
  customerEmail,
}: ResolveUserArgs,
) {
  const byExternalId = await getUserById(convex, customerExternalId);
  if (byExternalId) {
    return byExternalId;
  }

  const byCustomerId = await getUserByPolarCustomer(convex, customerId);
  if (byCustomerId) {
    return byCustomerId;
  }

  return await getUserByEmail(convex, customerEmail);
}

export const POST = async (request: NextRequest) => {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL is not set" },
      { status: 500 },
    );
  }

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "POLAR_WEBHOOK_SECRET is not set" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);

  const handler = Webhooks({
    webhookSecret,
    onSubscriptionCreated: async (payload) => {
      const subscription = payload.data;
      const customerId = subscription.customerId;
      const customerExternalId = subscription.customer?.externalId;
      const customerEmail = subscription.customer?.email;

      if (!customerId) {
        return;
      }

      const user = await resolveUser(convex, {
        customerId,
        customerExternalId,
        customerEmail,
      });

      if (user) {
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId: user._id,
          subscriptionStatus: subscription.status,
          polarCustomerId: customerId,
          subscriptionId: subscription.id,
        });
      }
    },
    onSubscriptionUpdated: async (payload) => {
      const subscription = payload.data;
      const customerId = subscription.customerId;
      const customerExternalId = subscription.customer?.externalId;
      const customerEmail = subscription.customer?.email;

      if (!customerId) {
        return;
      }

      const user = await resolveUser(convex, {
        customerId,
        customerExternalId,
        customerEmail,
      });

      if (user) {
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId: user._id,
          subscriptionStatus: subscription.status,
          polarCustomerId: customerId,
          subscriptionId: subscription.id,
        });
      }
    },
    onSubscriptionCanceled: async (payload) => {
      const subscription = payload.data;
      const customerId = subscription.customerId;
      const customerExternalId = subscription.customer?.externalId;
      const customerEmail = subscription.customer?.email;

      if (!customerId) {
        return;
      }

      const user = await resolveUser(convex, {
        customerId,
        customerExternalId,
        customerEmail,
      });

      if (user) {
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId: user._id,
          subscriptionStatus: subscription.status,
          polarCustomerId: customerId,
          subscriptionId: null,
        });
      }
    },
    onCheckoutUpdated: async (payload) => {
      const checkout = payload.data;
      if (checkout.status !== "succeeded") {
        return;
      }

      const customerId = checkout.customerId;
      const customerExternalId =
        checkout.externalCustomerId || checkout.customerExternalId;
      const customerEmail = checkout.customerEmail;
      const subscriptionId = checkout.subscriptionId;

      if (!customerId || !subscriptionId) {
        return;
      }

      const user = await resolveUser(convex, {
        customerId,
        customerExternalId,
        customerEmail,
      });

      if (user) {
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId: user._id,
          subscriptionStatus: "active",
          polarCustomerId: customerId,
          subscriptionId,
        });
      }
    },
  });

  return handler(request);
};
