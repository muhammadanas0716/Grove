import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const migrateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      const updates: any = {};
      if (user.subscriptionStatus === undefined) {
        updates.subscriptionStatus = null;
      }
      if (user.polarCustomerId === undefined) {
        updates.polarCustomerId = null;
      }
      if (user.subscriptionId === undefined) {
        updates.subscriptionId = null;
      }
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
    }
    
    return { migrated: users.length };
  },
});
