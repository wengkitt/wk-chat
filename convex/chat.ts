import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { CoreMessage, generateText } from "ai";
import { openai } from "ai/openai";
import { anthropic } from "ai/anthropic";
import { google } from "ai/google";

// Helper function to get current timestamp
const now = () => Date.now();

// --- CHATS ---

export const createChat = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      createdAt: now(),
      name: args.name,
    });
    return chatId;
  },
});

export const listChats = query({
  handler: async (ctx) => {
    const chats = await ctx.db.query("chats").order("desc").collect();
    return chats;
  },
});

// --- MESSAGES ---

export const listMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    if (!args.chatId) {
      return [];
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc") // Show oldest messages first
      .collect();
    return messages;
  },
});

export const sendMessage = action({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    model: v.string(), // e.g., "gpt-3.5-turbo", "claude-3-opus-20240229", "gemini-pro"
  },
  handler: async (ctx, args) => {
    // 1. Save user message
    await ctx.runMutation(api.chat.internalSaveMessage, {
      chatId: args.chatId,
      role: "user",
      content: args.content,
      model: args.model, // User message is associated with the model it's intended for
    });

    let assistantResponse = "";
    // For AI context, create a list of messages. Start with the user's new message.
    // In a more advanced setup, you'd fetch previous messages from this chat.
    const messages: CoreMessage[] = [{ role: "user", content: args.content }];
    // Example: Fetching conversation history (implement internal.chat.getMessagesForContext query)
    // try {
    //   const history = await ctx.runQuery(api.chat.getMessagesForContext, { chatId: args.chatId, limit: 10 });
    //   messages = [...history.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })), { role: "user", content: args.content }];
    // } catch (e) {
    //   console.warn("Could not get message history for context:", e);
    // }


    try {
      const openAIKey = process.env.OPENAI_API_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const googleKey = process.env.GOOGLE_API_KEY;

      if (args.model.startsWith("gpt-")) {
        if (!openAIKey) throw new Error("OpenAI API key (OPENAI_API_KEY) is not configured in Convex environment variables.");
        const modelInstance = openai(args.model, { apiKey: openAIKey });
        const result = await generateText({ model: modelInstance, messages });
        assistantResponse = result.text;
      } else if (args.model.startsWith("claude-")) {
        if (!anthropicKey) throw new Error("Anthropic API key (ANTHROPIC_API_KEY) is not configured in Convex environment variables.");
        const modelInstance = anthropic(args.model, { apiKey: anthropicKey });
        const result = await generateText({ model: modelInstance, messages });
        assistantResponse = result.text;
      } else if (args.model.startsWith("gemini-")) { // Google Gemini
        if (!googleKey) throw new Error("Google API key (GOOGLE_API_KEY) is not configured in Convex environment variables.");
        // Vercel AI SDK for Google often expects model names like "models/gemini-pro"
        const googleModelName = args.model.includes("/") ? args.model : `models/${args.model}`;
        const modelInstance = google(googleModelName, { apiKey: googleKey });
        const result = await generateText({ model: modelInstance, messages });
        assistantResponse = result.text;
      } else {
        throw new Error(`Unsupported model: ${args.model}. Ensure it starts with 'gpt-', 'claude-', or 'gemini-'.`);
      }
    } catch (error: any) {
      console.error(`Error calling AI model ${args.model}:`, error);
      assistantResponse = `Error: Could not get response from ${args.model}. ${error.message || "Check server logs for more details."}`;
    }

    // 3. Save assistant message
    await ctx.runMutation(api.chat.internalSaveMessage, {
      chatId: args.chatId,
      role: "assistant",
      content: assistantResponse,
      model: args.model,
    });

    return "success";
  },
});

// Internal mutation to save messages, used by the sendMessage action.
export const internalSaveMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      model: args.model,
      timestamp: now(),
    });
  },
});

// Optional: Placeholder for a query to get messages for context
// export const getMessagesForContext = query({
//   args: { chatId: v.id("chats"), limit: v.number() },
//   handler: async (ctx, args) => {
//     return ctx.db
//       .query("messages")
//       .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
//       .order("desc") // Get newest first for context
//       .take(args.limit)
//       .collect()
//       .then((res) => res.reverse()); // Reverse to maintain chronological order for AI
//   },
// });
