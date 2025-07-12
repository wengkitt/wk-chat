"use client";

import { getProviderForModel, hasApiKeyForProvider } from "@/utils";
import { useMutation, useQuery } from "convex/react";
import { Paperclip, SendHorizontal, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ModelSelector from "./model-selector";

interface ChatInputProps {
  chatId?: Id<"chats">; // Optional chatId for creating new chats
}

export function ChatInput({ chatId: currentChatId }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>("");
  const models = useQuery(api.models.getModels);
  const createChat = useMutation(api.chats.createChat);

  useEffect(() => {
    if (models && models.length > 0) {
      const defaultModel = models[0].name;
      setCurrentModel(defaultModel);
    }
  }, [models]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const internalHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const provider = getProviderForModel(currentModel);
    if (!hasApiKeyForProvider(provider)) {
      const modelInfo = models?.find((m) => m.name === currentModel);
      const shouldRedirect = confirm(
        `You need to add an API key for ${modelInfo?.provider} to use this model. Would you like to add one now?`
      );
      if (shouldRedirect) {
        router.push("/api-keys");
      }
      return;
    }

    if (!currentChatId) {
      createChat({
        title: `New Chat`,
        firstMessage: inputValue,
        model: currentModel,
      }).then(({ chatId }) => {
        if (chatId) {
          router.push(`/chat/${chatId}`);
        }
      });
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Don't render until models are loaded to avoid hydration mismatch
  if (!models) {
    return null;
  }

  const currentProvider = getProviderForModel(currentModel);
  const hasRequiredApiKey = hasApiKeyForProvider(currentProvider);

  return (
    <div className="border-t border-base-300 bg-base-100 p-4">
      <form onSubmit={internalHandleSubmit} className="max-w-4xl mx-auto">
        {!hasRequiredApiKey && (
          <div className="alert alert-warning mb-4">
            <TriangleAlert className="w-5 h-5" />
            <div>
              <div className="font-bold">API Key Required</div>
              <div className="text-sm">
                You need to add an API key for{" "}
                {models.find((m) => m.name === currentModel)?.provider} to use
                this model.
                <Link href="/api-keys" className="link link-primary ml-1">
                  Add API Key
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              hasRequiredApiKey
                ? "Type your message..."
                : "Add an API key to start chatting..."
            }
            disabled={isLoading || !hasRequiredApiKey}
            className="textarea textarea-bordered w-full min-h-[60px] max-h-[200px] resize-none text-base"
            rows={1}
          />

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="loading loading-spinner loading-sm"></div>
            )}

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || !hasRequiredApiKey}
              className="btn btn-ghost btn-xs"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-base-content/60">
          <div className="flex items-center gap-4">
            <ModelSelector
              models={models}
              currentModel={currentModel}
              setCurrentModel={setCurrentModel}
            />
            <span className="hidden sm:inline">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
