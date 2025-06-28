"use client";
import { Message } from "@/types";
import { Copy, RefreshCw } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Message copied!");
  };

  const handleRegenerate = () => {
    alert(`Regenerate response for message #${message.id}`);
    // You can implement actual regeneration logic here
  };

  return (
    <div
      className={`flex w-full gap-3 py-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex flex-col items-end max-w-[75vw]">
        <div
          className={`relative inline-block px-5 py-3 group transition-all
            ${
              isUser
                ? "bg-primary text-primary-content rounded-2xl rounded-br-md"
                : "bg-secondary text-secondary-content border border-base-200 rounded-2xl rounded-bl-md shadow-sm"
            }
          `}
        >
          {/* Name and timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-xs">
              {isUser ? "You" : message.model || "Assistant"}
            </span>
            <span className="text-[10px]">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        {/* Action buttons UNDER the bubble */}
        <div
          className={`flex flex-row gap-1 mt-1 w-full opacity-0 hover:opacity-100 transition-opacity ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <button
            onClick={() => handleCopy(message.content)}
            className="btn btn-ghost btn-xs p-1"
            title="Copy message"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!isUser && (
            <button
              onClick={handleRegenerate}
              className="btn btn-ghost btn-xs p-1"
              title="Regenerate response"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {/* No avatar */}
    </div>
  );
}

export default ChatMessage;
