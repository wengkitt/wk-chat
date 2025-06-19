import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    createdAt: v.number(), // Using number for timestamp (e.g., Date.now())
    modelUsed: v.optional(v.string()), // Store the model ID used for this chat
    // If we decide to link chats to users later, we'd add a userId field here.
  }),
  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")), // Added "system" for potential future use
    content: v.string(),
    timestamp: v.number(), // Using number for timestamp
    modelUsed: v.optional(v.string()), // Store the model ID used for this message (especially for assistant messages)
  }).index("by_chatId", ["chatId"]) // Added index here
  // We can add a users table later if needed:
  // users: defineTable({
  //   name: v.optional(v.string()),
  //   // other user-specific fields
  // })
});
