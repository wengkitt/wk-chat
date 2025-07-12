import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const processFirstMessage = internalAction({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.runQuery(api.messages.getMessagesForChat, {
      chatId: args.chatId,
    });

    const excludeIds = [args.messageId];
    const filteredMessages = allMessages.filter(
      (msg) => !excludeIds.includes(msg._id)
    );

    try {
      const providerModel = google("gemini-2.0-flash");

      const response = streamText({
        model: providerModel,
        prompt: filteredMessages[0].content,
      });

      let fullResponse = "";
      for await (const chunk of response.textStream) {
        fullResponse += chunk;
        await ctx.runMutation(internal.messages.updateMessage, {
          messageId: args.messageId,
          content: fullResponse,
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.messages.updateMessage, {
        messageId: args.messageId,
        content: "Error processing message. Please try again later.",
      });
    }
  },
});
