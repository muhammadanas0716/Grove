import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.union(v.string(), v.null()),
    emailVerified: v.union(v.string(), v.null()),
    image: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      throw new Error("User already exists");
    }
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      emailVerified: args.emailVerified,
      image: args.image,
      createdAt: Date.now(),
      subscriptionStatus: null,
      polarCustomerId: null,
      subscriptionId: null,
    });
    return userId;
  },
});

export const verifyPassword = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.union(v.string(), v.null())),
    image: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.emailVerified !== undefined) updateData.emailVerified = updates.emailVerified;
    if (updates.image !== undefined) updateData.image = updates.image;
    await ctx.db.patch(id, updateData);
  },
});

export const createAccount = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", args);
  },
});

export const getAccountByProvider = query({
  args: { provider: v.string(), providerAccountId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_provider", (q) =>
        q.eq("provider", args.provider).eq("providerAccountId", args.providerAccountId)
      )
      .first();
  },
});

export const getAccountsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const deleteAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", args);
  },
});

export const getSessionByToken = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_session_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
  },
});

export const deleteSession = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteSessionsByUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
  },
});

export const createVerificationToken = mutation({
  args: {
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("verificationTokens", args);
  },
});

export const getVerificationTokenByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("verificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

export const deleteVerificationToken = mutation({
  args: { id: v.id("verificationTokens") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
