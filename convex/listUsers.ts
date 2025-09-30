import { query } from "./_generated/server";

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").collect();
    return users;
  },
});

