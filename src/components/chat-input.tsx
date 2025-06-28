"use client";

import {
  getProviderForModel,
  hasApiKeyForProvider,
  getApiKeyForProvider,
} from "@/utils";
import {
  Brain,
  ChevronDown,
  Paperclip,
  SendHorizontal,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

// You may want to move this to a shared file if used elsewhere
const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Gemini" },
];

export function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(models[0].id);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Example: Replace with your actual new chat logic
  const onNewChat = async (): Promise<string | null> => {
    // Simulate API call
    return new Promise((resolve) =>
      setTimeout(() => resolve("new-chat-id"), 500)
    );
  };

  // Example: Replace with your actual submit logic
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options?: { body: any }
  ) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setInputValue("");
  };

  const internalHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const provider = getProviderForModel(currentModel);
    if (!hasApiKeyForProvider(provider)) {
      const modelInfo = models.find((m) => m.id === currentModel);
      const shouldRedirect = confirm(
        `You need to add an API key for ${modelInfo?.provider} to use this model. Would you like to add one now?`
      );
      if (shouldRedirect) {
        router.push("/api-keys");
      }
      return;
    }

    if (!currentChatId) {
      onNewChat().then((newId) => {
        if (newId) {
          setCurrentChatId(newId);
          handleSubmit(e, {
            body: {
              apiKey: getApiKeyForProvider(getProviderForModel(currentModel)),
              model: currentModel,
              chatId: newId,
            },
          });
        }
      });
    } else {
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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
                {models.find((m) => m.id === currentModel)?.provider} to use
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
            {/* Model Selector */}
            <div className="dropdown dropdown-top">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-xs flex items-center gap-1"
                title="Select AI Model"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {models.find((m) => m.id === currentModel)?.name ||
                    "Select Model"}
                </span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300 mb-2"
              >
                {models.map((model) => {
                  const modelProvider = getProviderForModel(model.id);
                  const hasKey = hasApiKeyForProvider(modelProvider);

                  return (
                    <li key={model.id}>
                      <button
                        onClick={() => setCurrentModel(model.id)}
                        className={`${
                          currentModel === model.id ? "active" : ""
                        } ${!hasKey ? "opacity-50" : ""}`}
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {model.name}
                            {!hasKey && (
                              <TriangleAlert className="w-3 h-3 text-warning" />
                            )}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {model.provider}
                            {!hasKey && " • API key required"}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

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
