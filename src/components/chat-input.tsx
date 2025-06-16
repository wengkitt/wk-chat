import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  currentModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
];

function ChatInput({
  onSendMessage,
  isLoading,
  placeholder = "Type your message...",
  currentModel,
  onModelChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-base-300 bg-base-100 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="textarea textarea-bordered w-full min-h-[60px] max-h-[200px] resize-none pr-12 text-base"
            rows={1}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {isLoading && (
              <div className="loading loading-spinner loading-sm"></div>
            )}

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="btn btn-primary btn-sm btn-circle"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {models.find((m) => m.id === currentModel)?.name ||
                    "Select Model"}
                </span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300 mb-2"
              >
                {models.map((model) => (
                  <li key={model.id}>
                    <a
                      onClick={() => onModelChange(model.id)}
                      className={currentModel === model.id ? "active" : ""}
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-base-content/60">
                          {model.provider}
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatInput;
