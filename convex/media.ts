import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireActiveAccess, requireProjectAccess } from "./access";

export const generateUploadUrl = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireActiveAccess(ctx, args.userId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveMedia = mutation({
  args: {
    userId: v.id("users"),
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    kind: v.union(v.literal("video"), v.literal("image")),
    name: v.string(),
    size: v.number(),
    mimeType: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { role } = await requireProjectAccess(ctx, args.userId, args.projectId);
    if (role !== "owner") {
      throw new Error("Only owners can upload media");
    }
    const now = Date.now();
    const mediaId = await ctx.db.insert("media", {
      ownerId: args.userId,
      projectId: args.projectId,
      kind: args.kind,
      storageId: args.storageId,
      name: args.name,
      size: args.size,
      mimeType: args.mimeType,
      createdAt: now,
    });
    return mediaId;
  },
});

export const listByProject = query({
  args: { userId: v.id("users"), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.userId, args.projectId);
    const items = await ctx.db
      .query("media")
      .withIndex("by_project_created", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return await Promise.all(
      items.map(async (item) => ({
        _id: item._id,
        kind: item.kind,
        name: item.name,
        size: item.size,
        mimeType: item.mimeType,
        createdAt: item.createdAt,
        url: await ctx.storage.getUrl(item.storageId),
      }))
    );
  },
});

export const getById = query({
  args: { userId: v.id("users"), mediaId: v.id("media") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    if (media.ownerId !== args.userId) {
      await requireProjectAccess(ctx, args.userId, media.projectId);
    } else {
      await requireActiveAccess(ctx, args.userId);
    }

    return {
      _id: media._id,
      kind: media.kind,
      name: media.name,
      size: media.size,
      mimeType: media.mimeType,
      createdAt: media.createdAt,
      url: await ctx.storage.getUrl(media.storageId),
    };
  },
});
