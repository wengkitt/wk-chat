import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    // userId: v.optional(v.string()), // Optional: If we add user authentication later
    name: v.optional(v.string()), // Optional: For naming chats, e.g., "Chat about Convex"
    createdAt: v.number(), // Store as milliseconds since epoch
  }),
  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")), // Added "system" for potential future use
    content: v.string(),
    model: v.optional(v.string()), // e.g., "gpt-4", "claude-3"
    timestamp: v.number(), // Store as milliseconds since epoch
    // Optional: For storing additional data like token counts, etc.
    // metadata: v.optional(v.any()),
  }).index("by_chatId", ["chatId"]), // Add this line
  // We can add a users table later if we implement authentication
  // users: defineTable({
  //   name: v.string(),
  //   email: v.string(),
  //   // other fields
  // }).index("by_email", ["email"])
});
