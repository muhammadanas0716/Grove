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

  projects: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    inviteToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_invite_token", ["inviteToken"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("collaborator")),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_user_project", ["userId", "projectId"]),

  media: defineTable({
    ownerId: v.id("users"),
    projectId: v.id("projects"),
    kind: v.union(v.literal("video"), v.literal("image")),
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    mimeType: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_created", ["projectId", "createdAt"])
    .index("by_owner", ["ownerId"]),

  notes: defineTable({
    mediaId: v.id("media"),
    authorId: v.id("users"),
    body: v.string(),
    timestamp: v.union(v.number(), v.null()),
    createdAt: v.number(),
  })
    .index("by_media", ["mediaId"])
    .index("by_media_created", ["mediaId", "createdAt"])
    .index("by_author", ["authorId"]),
});
