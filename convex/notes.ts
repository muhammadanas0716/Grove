import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProjectAccess } from "./access";

export const listByMedia = query({
  args: { userId: v.id("users"), mediaId: v.id("media") },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }
    await requireProjectAccess(ctx, args.userId, media.projectId);

    return await ctx.db
      .query("notes")
      .withIndex("by_media_created", (q) => q.eq("mediaId", args.mediaId))
      .order("desc")
      .collect()
      .then(async (items) =>
        Promise.all(
          items.map(async (note) => {
            const author = await ctx.db.get(note.authorId);
            return {
              _id: note._id,
              body: note.body,
              timestamp: note.timestamp,
              createdAt: note.createdAt,
              authorId: note.authorId,
              authorName: author?.name ?? "Unknown",
            };
          })
        )
      );
  },
});

export const addNote = mutation({
  args: {
    userId: v.id("users"),
    mediaId: v.id("media"),
    body: v.string(),
    timestamp: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }
    await requireProjectAccess(ctx, args.userId, media.projectId);

    const body = args.body.trim();
    if (!body) {
      throw new Error("Note cannot be empty");
    }

    return await ctx.db.insert("notes", {
      mediaId: args.mediaId,
      authorId: args.userId,
      body,
      timestamp: args.timestamp ?? null,
      createdAt: Date.now(),
    });
  },
});
