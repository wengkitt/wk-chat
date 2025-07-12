import { query } from "./_generated/server";

export const getModels = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
    return models;
  },
});
