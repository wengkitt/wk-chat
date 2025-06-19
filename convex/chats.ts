import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to list all chats.
// In a real app, you'd likely filter by user or session.
export const list = query({
  args: {}, // No arguments for now, lists all chats
  handler: async (ctx) => {
    return await ctx.db.query("chats").order("desc").collect();
  },
});

// Mutation to create a new chat session.
export const create = mutation({
  args: {
    title: v.string(),
    modelUsed: v.optional(v.string()), // Optional: model used to initiate the chat
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      createdAt: Date.now(),
      modelUsed: args.modelUsed,
    });
    return chatId;
  },
});

// Mutation to delete a chat session and all its messages.
export const remove = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    // First, delete all messages associated with this chat
    const messagesToDelete = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    await Promise.all(messagesToDelete.map((msg) => ctx.db.delete(msg._id)));

    // Then, delete the chat itself
    await ctx.db.delete(args.id);
    return true; // Indicate success
  },
});

// Mutation to update a chat's title
export const updateTitle = mutation({
  args: {
    id: v.id("chats"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.newTitle });
    return true;
  }
});
