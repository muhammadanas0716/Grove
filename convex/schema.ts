import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.union(v.string(), v.null()),
    emailVerified: v.union(v.string(), v.null()),
    image: v.union(v.string(), v.null()),
    createdAt: v.number(),
    subscriptionStatus: v.union(v.string(), v.null()),
    polarCustomerId: v.union(v.string(), v.null()),
    subscriptionId: v.union(v.string(), v.null()),
  })
    .index("by_email", ["email"])
    .index("by_email_verified", ["emailVerified"])
    .index("by_polar_customer", ["polarCustomerId"]),

  accounts: defineTable({
    userId: v.id("users"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.union(v.string(), v.null()),
    access_token: v.union(v.string(), v.null()),
    expires_at: v.union(v.number(), v.null()),
    token_type: v.union(v.string(), v.null()),
    scope: v.union(v.string(), v.null()),
    id_token: v.union(v.string(), v.null()),
    session_state: v.union(v.string(), v.null()),
  })
    .index("by_provider", ["provider", "providerAccountId"])
    .index("by_user", ["userId"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  })
    .index("by_session_token", ["sessionToken"])
    .index("by_user", ["userId"]),

  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  })
    .index("by_token", ["token"]),
});
