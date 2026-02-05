import { Id } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireActiveAccess(ctx: Ctx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const status = user.subscriptionStatus ?? "inactive";
  const isActive = status === "active" || status === "trialing";
  if (!isActive) {
    throw new Error("Access denied");
  }

  return user;
}

export async function requireProjectAccess(
  ctx: Ctx,
  userId: Id<"users">,
  projectId: Id<"projects">
) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId === userId) {
    await requireActiveAccess(ctx, userId);
    return { project, role: "owner" as const };
  }

  const membership = await ctx.db
    .query("projectMembers")
    .withIndex("by_user_project", (q) =>
      q.eq("userId", userId).eq("projectId", projectId)
    )
    .first();

  if (!membership) {
    throw new Error("Access denied");
  }

  return { project, role: membership.role };
}
