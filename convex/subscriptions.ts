import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      subscriptionStatus: user.subscriptionStatus,
      polarCustomerId: user.polarCustomerId,
      subscriptionId: user.subscriptionId,
    };
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionStatus: v.union(v.string(), v.null()),
    polarCustomerId: v.union(v.string(), v.null()),
    subscriptionId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const updateData: any = {};
    if (updates.subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = updates.subscriptionStatus;
    }
    if (updates.polarCustomerId !== undefined) {
      updateData.polarCustomerId = updates.polarCustomerId;
    }
    if (updates.subscriptionId !== undefined) {
      updateData.subscriptionId = updates.subscriptionId;
    }
    await ctx.db.patch(userId, updateData);
  },
});

export const getUserByPolarCustomer = query({
  args: { polarCustomerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_polar_customer", (q) => q.eq("polarCustomerId", args.polarCustomerId))
      .first();
  },
});
