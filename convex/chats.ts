import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
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
    message: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
    });

    await ctx.runMutation(internal.messages.addMessage, {
      chatId: chatId,
      content: args.message,
      role: "user",
      model: args.model,
    });

    const messageId = await ctx.runMutation(internal.messages.addMessage, {
      chatId: chatId,
      content: "",
      role: "assistant",
      model: args.model,
    });

    ctx.scheduler.runAfter(0, internal.ai.processChatMessage, {
      chatId: chatId,
      messageId: messageId,
      isNewChat: true,
    });

    return { chatId };
  },
});

export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.message,
      role: "user",
      model: args.model,
    });

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: "",
      role: "assistant",
      model: args.model,
    });

    ctx.scheduler.runAfter(0, internal.ai.processChatMessage, {
      chatId: args.chatId,
      messageId: messageId,
      isNewChat: false,
    });
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

export const updateChatTitle = internalMutation({
  args: {
    id: v.id("chats"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.newTitle });
    return true;
  },
});
