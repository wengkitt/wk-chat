import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const getChats = query({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").order("desc").collect();
    return chats;
  },
});

export const createChat = mutation({
  args: {
    title: v.string(),
    firstMessage: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
    });

    await ctx.db.insert("messages", {
      chatId: chatId,
      content: args.firstMessage,
      role: "user",
      model: args.model,
    });

    const messageId = await ctx.db.insert("messages", {
      chatId: chatId,
      content: "",
      role: "assistant",
      model: args.model,
    });

    ctx.scheduler.runAfter(0, internal.ai.processFirstMessage, {
      chatId: chatId,
      messageId: messageId,
    });

    return { chatId };
  },
});

export const removeChat = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx, args) => {
    const messagesToDelete = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    await Promise.all(messagesToDelete.map((msg) => ctx.db.delete(msg._id)));
    await ctx.db.delete(args.id);
    return true;
  },
});

export const updateChatTitle = mutation({
  args: {
    id: v.id("chats"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.newTitle });
    return true;
  },
});
