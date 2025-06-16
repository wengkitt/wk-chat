import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { ChatInput, ChatMessage, WelcomeScreen } from "../components";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
}

interface ChatContext {
  currentModel: string;
  currentChatId: string | null;
  chats: any[];
  onNewChat: () => void;
  onModelChange: (model: string) => void;
}

function Chat() {
  const { currentModel, currentChatId, onNewChat, onModelChange } =
    useOutletContext<ChatContext>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for current chat (mock data for demo)
  useEffect(() => {
    if (currentChatId) {
      // In a real app, you'd load messages from your backend/storage
      setMessages([
        {
          id: "1",
          content: "Hello! How can I help you today?",
          role: "assistant",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          model: currentModel,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [currentChatId, currentModel]);

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) {
      onNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about: "${content}". This is a demo response from ${currentModel}. In a real implementation, this would be connected to the actual AI model APIs.`,
        role: "assistant",
        timestamp: new Date(),
        model: currentModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could show a toast notification here
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMessage) {
        // Remove the last assistant message and regenerate
        setMessages((prev) => prev.slice(0, -1));
        handleSendMessage(lastUserMessage.content);
      }
    }
  };

  const handleExampleClick = (example: string) => {
    handleSendMessage(example);
  };

  if (!currentChatId && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <WelcomeScreen onExampleClick={handleExampleClick} />
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          currentModel={currentModel}
          onModelChange={onModelChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopyMessage}
            onRegenerate={
              message.role === "assistant" ? handleRegenerate : undefined
            }
          />
        ))}

        {isLoading && (
          <div className="flex gap-4 p-6 bg-base-200/50">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                <svg
                  className="w-5 h-5"
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
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{currentModel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="loading loading-dots loading-sm"></span>
                <span className="text-sm text-base-content/60">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentModel={currentModel}
        onModelChange={onModelChange}
      />
    </div>
  );
}

export default Chat;
