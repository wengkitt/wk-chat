import { httpAction } from "./_generated/server"; // For HTTP actions
import { v } from "convex/values";
import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { StreamData, StreamingTextResponse, streamText, Message } from "ai"; // Added Message type
import { api } from "./_generated/api"; // For calling other mutations/actions

export const chat = httpAction(async (ctx, request) => {
  // The request body will be a ReadableStream if using SDK's send directly.
  // Or JSON if we send it from a custom fetch.
  // useChat by default sends a JSON body with messages, id, stream, etc.
  const { messages, model, apiKey, chatId, previewToken } = await request.json();


  if (!chatId) {
    return new Response(JSON.stringify({ error: "chatId is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const validatedMessages = messages as Message[]; // Cast to Vercel AI SDK Message type

  let streamResult;

  try {
    if (model.startsWith("gpt-")) {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      streamResult = await streamText({
        model: openai.chat.completions.create({
          model: model,
          messages: validatedMessages,
          stream: true,
        }),
        messages: validatedMessages, // Pass original messages for context if needed by streamText processing
      });
    } else if (model.startsWith("claude-")) {
      const anthropic = new Anthropic({ apiKey });
      // Anthropic SDK requires system prompt to be passed differently if present
      const systemPrompt = validatedMessages.find(m => m.role === 'system')?.content;
      const userAndAssistantMessages = validatedMessages.filter(m => m.role !== 'system');

      streamResult = await streamText({
        model: anthropic.messages.stream({
          model: model, // e.g., "claude-3-opus-20240229"
          messages: userAndAssistantMessages, // Anthropic expects this format
          system: systemPrompt,
          max_tokens: 1024, // Example, adjust as needed
        }),
        messages: userAndAssistantMessages, // Pass for context
        system: systemPrompt,
      });
    } else {
      return new Response(JSON.stringify({ error: `Unsupported model: ${model}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e) {
    console.error("Failed to initialize AI provider or stream text:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error during AI stream initialization.";
    return new Response(JSON.stringify({ error: `AI stream initialization failed: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const data = new StreamData();

  // Pipe the stream, and save the assistant's response upon completion.
  const outputStream = streamResult.toReadableStream().pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      async flush(controller) {
        const fullResponse = await streamResult.text(); // Get the full text once streaming is done

        try {
          await ctx.runMutation(api.messages.add, {
            chatId: chatId,
            role: "assistant",
            content: fullResponse,
            modelUsed: model,
          });
          data.append({ status: 'Assistant message saved' }); // Optional: send status back if needed
        } catch (e) {
            console.error("Failed to save assistant message:", e);
            // Optional: append error information to StreamData if frontend needs to know
            data.append({ error: "Failed to save assistant message: " + (e instanceof Error ? e.message : String(e)) });
        } finally {
            data.close();
            controller.terminate();
        }
      },
    })
  );

  return new StreamingTextResponse(outputStream, {}, data);
});
