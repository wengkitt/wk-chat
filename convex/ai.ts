import { google } from "@ai-sdk/google";
import { CoreMessage, generateText, streamText } from "ai";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const processChatMessage = internalAction({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    isNewChat: v.boolean(),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.runQuery(api.messages.getMessagesForChat, {
      chatId: args.chatId,
    });

    const excludeIds = [args.messageId]; // remove this messageId , it's for patching streaming response
    const filteredMessages = allMessages.filter(
      (msg) => !excludeIds.includes(msg._id)
    );

    const formattedMessages = filteredMessages.map((msg) => {
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    if (args.isNewChat) {
      const recentMessages = formattedMessages.slice(0, 5); // use only first few
      try {
        const newTitle = await ctx.runAction(internal.ai.generateChatTitle, {
          messages: recentMessages,
        });
        if (newTitle) {
          await ctx.runMutation(internal.chats.updateChatTitle, {
            id: args.chatId,
            newTitle,
          });
        }
      } catch (err) {
        console.error("Failed to generate chat title:", err);
      }
    }

    const model =
      filteredMessages[0]?.model ||
      (await ctx.runQuery(api.models.getDefaultModel))?.name ||
      "gemini-2.0-flash";

    try {
      const providerModel = google(model);

      const response = streamText({
        model: providerModel,
        system: `
                  You are a helpful assistant.
                  All responses must be valid GitHub-Flavoured Markdown.

                  - Use fenced code blocks with an explicit language tag, e.g. \`\`\`typescript.
                  - Add a file name or title when it helps the user: \`\`\`js title="app/page.tsx".
                  - Prefer concise inline answers; for large outputs wrap them in:
                    <details>
                      <summary>Click to expand</summary>

                  \`\`\`language
                  ... long code / logs ...
                  \`\`\`

                    </details>
                  - Do not wrap the entire reply in triple backticks unless you are showing raw markdown itself.
                  `.trim(),
        messages: formattedMessages,
      });

      let fullResponse = "";
      for await (const chunk of response.textStream) {
        fullResponse += chunk;
        await ctx.runMutation(internal.messages.updateMessage, {
          messageId: args.messageId,
          content: fullResponse,
          model: model,
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.messages.updateMessage, {
        messageId: args.messageId,
        content: "Error processing message. Please try again later.",
        model: model,
      });
    }
  },
});

export const generateChatTitle = internalAction({
  args: {
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const model = google("gemini-2.0-flash-lite");

    const systemPrompt = `
    You are an assistant that generates concise, descriptive titles for chat conversations.
    Return a very short title (max 8 words) that captures the essence of the conversation.
    Do not include punctuation like "." or quotation marks.
    Only return the title itself — no preamble or explanation.
  `.trim();

    const response = await generateText({
      model,
      system: systemPrompt,
      messages: args.messages as CoreMessage[],
    });

    return response.text.trim();
  },
});
