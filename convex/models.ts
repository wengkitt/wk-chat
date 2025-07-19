import { query } from "./_generated/server";

export const getModels = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db.query("models").collect();
    return models;
  },
});

export const getDefaultModel = query({
  args: {},
  handler: async (ctx) => {
    const defaultModel = await ctx.db
      .query("models")
      .filter((q) => q.eq("isDefault", "true"))
      .first();
    return defaultModel;
  },
});
