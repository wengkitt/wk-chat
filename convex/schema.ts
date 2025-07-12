import { time } from "console";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
  }),
  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    model: v.string(),
  }).index("by_chatId", ["chatId"]),
  models: defineTable({
    name: v.string(),
    displayName: v.string(),
    provider: v.string(),
  }),
});
