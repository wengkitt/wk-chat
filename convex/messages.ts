import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get messages for a selected chat.
// It orders messages by their creation timestamp.
export const getForChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc") // Show oldest messages first
      .collect();
  },
});

// Mutation to add a new message to a chat.
// This will be used primarily for user messages.
// Assistant messages will be added via the LLM action after generation.
export const add = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    modelUsed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      modelUsed: args.modelUsed,
    });
    return messageId;
  },
});

// (Optional) A helper mutation if we want to generate a title based on the first user message.
// This could be called after the first user message is added.
export const generateTitleForChat = mutation({
    args: { chatId: v.id("chats"), firstMessageContent: v.string() },
    handler: async (ctx, args) => {
        // Simple title generation: take the first few words.
        // A more sophisticated approach might involve calling an LLM.
        const title = args.firstMessageContent.split(" ").slice(0, 5).join(" ") + "...";
        await ctx.db.patch(args.chatId, { title: title });
        return title;
    }
});
