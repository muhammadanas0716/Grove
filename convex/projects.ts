import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireActiveAccess, requireProjectAccess } from "./access";

const generateToken = () =>
  `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export const getUserProject = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireActiveAccess(ctx, args.userId);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", args.userId))
      .order("desc")
      .first();
    return project ?? null;
  },
});

export const getProjectById = query({
  args: { userId: v.id("users"), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { project, role } = await requireProjectAccess(
      ctx,
      args.userId,
      args.projectId
    );
    return {
      _id: project._id,
      name: project.name,
      ownerId: project.ownerId,
      inviteToken: project.inviteToken,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      role,
    };
  },
});

export const createProject = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    await requireActiveAccess(ctx, args.userId);
    const trimmed = args.name.trim();
    if (!trimmed) {
      throw new Error("Project name is required");
    }
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      ownerId: args.userId,
      name: trimmed,
      inviteToken: generateToken(),
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("projectMembers", {
      projectId,
      userId: args.userId,
      role: "owner",
      createdAt: now,
    });
    return projectId;
  },
});

export const acceptInvite = mutation({
  args: { userId: v.id("users"), token: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.token))
      .first();
    if (!project) {
      throw new Error("Invite link is invalid or expired");
    }

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", args.userId).eq("projectId", project._id)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        userId: args.userId,
        role: "collaborator",
        createdAt: Date.now(),
      });
    }

    return project._id;
  },
});

export const ensureInviteToken = mutation({
  args: { userId: v.id("users"), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireActiveAccess(ctx, args.userId);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== args.userId) {
      throw new Error("Project not found");
    }
    if (project.inviteToken) return project.inviteToken;
    const inviteToken = generateToken();
    await ctx.db.patch(project._id, { inviteToken });
    return inviteToken;
  },
});

export const checkAccess = query({
  args: {
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    mediaId: v.optional(v.id("media")),
  },
  handler: async (ctx, args) => {
    let projectId = args.projectId ?? null;
    if (!projectId && args.mediaId) {
      const media = await ctx.db.get(args.mediaId);
      projectId = media?.projectId ?? null;
    }
    if (!projectId) return false;

    const project = await ctx.db.get(projectId);
    if (!project) return false;

    if (project.ownerId === args.userId) {
      try {
        await requireActiveAccess(ctx, args.userId);
        return true;
      } catch {
        return false;
      }
    }

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_user_project", (q) =>
        q.eq("userId", args.userId).eq("projectId", projectId as any)
      )
      .first();

    return !!membership;
  },
});
