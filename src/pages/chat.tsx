import { useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { ChatInput, ChatMessage, WelcomeScreen } from "../components";
import { useChat, type Message as VercelMessage } from "ai/react";
import { getApiKeyForProvider, getProviderForModel } from "../utils/api-keys";
import { useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DisplayMessage extends VercelMessage {
  timestamp: Date;
  model?: string;
}

interface ChatContext {
  currentModel: string;
  currentChatId: string | null;
  onNewChat: () => Promise<string | null | undefined>;
  onModelChange: (model: string) => void;
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.warn("VITE_CONVEX_URL is not set in .env. Chat functionality may not work.");
}
const CHAT_API_ENDPOINT = CONVEX_URL ? `${CONVEX_URL}/http/llm` : '/api/chat';


function Chat() {
  const { currentModel, currentChatId, onNewChat, onModelChange } =
    useOutletContext<ChatContext>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessagesQuery = useConvexQuery(
    api.messages.getForChat,
    currentChatId ? { chatId: currentChatId } : "skip"
  );

  const { messages, append, reload, isLoading, input, setInput, handleSubmit, error, setMessages } = useChat({
    api: CHAT_API_ENDPOINT,
    id: currentChatId || undefined,
    initialMessages: initialMessagesQuery
      ? initialMessagesQuery.map(
          (msg) =>
            ({
              id: msg._id,
              role: msg.role,
              content: msg.content,
              createdAt: new Date(msg.timestamp),
            } as VercelMessage)
        )
      : [],
    body: {
      apiKey: getApiKeyForProvider(getProviderForModel(currentModel)),
      model: currentModel,
      chatId: currentChatId,
    },
    onFinish: (message) => {
      console.log("Stream finished. Assistant message:", message.content);
    },
    onError: (err) => {
      console.error("Chat error:", err);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When currentChatId changes, useChat hook re-evaluates `initialMessages`
  // and if `id` prop also changes, it resets.
  // This useEffect handles setting messages from Convex query when chat ID changes,
  // ensuring that if useChat doesn't pick up new initialMessages on ID change alone,
  // we explicitly set them.
   useEffect(() => {
    if (currentChatId && initialMessagesQuery) {
      const newInitialMessages = initialMessagesQuery.map(msg => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.timestamp),
      } as VercelMessage));
      setMessages(newInitialMessages);
    } else if (!currentChatId) {
      setMessages([]); // Clear messages if there's no active chat
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId, initialMessagesQuery, setMessages]); // setMessages is from useChat, should be stable.


  const handleSendMessage = async (content: string) => {
    // This function is called by ChatInput if it were to manage its own submit.
    // However, with useChat, we typically pass handleSubmit or a wrapper to ChatInput.
    // For now, let's assume this might be used if we had a separate send button/logic.
    // The main form submission is handled by handleSubmit from useChat.
    let effectiveChatId = currentChatId;
    if (!effectiveChatId) {
      const newChatId = await onNewChat();
      if (newChatId) {
        // effectiveChatId = newChatId; // Not strictly needed here as append takes body override
        append(
          { role: "user", content: content },
          {
            body: { // Pass new chatId in the body for this specific call
              apiKey: getApiKeyForProvider(getProviderForModel(currentModel)),
              model: currentModel,
              chatId: newChatId,
            }
          }
        );
      } else {
        console.error("Failed to create or get new chat ID.");
      }
      return;
    }
    // If chat already exists, currentChatId in useChat's body is used.
    append({ role: "user", content: content });
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      reload();
    }
  };

  const handleExampleClick = (example: string) => {
    if (!currentChatId) {
        onNewChat().then(newId => {
            if (newId) {
                // Input is set, then user submits form which will use newId in its body.
                setInput(example);
            }
        });
        return;
    }
    setInput(example);
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const displayMessages: DisplayMessage[] = messages.map((msg) => ({
    ...msg,
    timestamp: msg.createdAt || new Date(), // msg.createdAt should be set by useChat
    model: msg.role === 'assistant' ? (msg.annotations?.find(a => a.type === 'model_identifier')_value || currentModel) : undefined,
  }));

  const commonChatInputProps = {
    isLoading: isLoading,
    currentModel: currentModel,
    onModelChange: onModelChange,
    inputValue: input,
    onInputChange: setInput,
  };

  if (!currentChatId && displayMessages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <WelcomeScreen onExampleClick={handleExampleClick} />
        <ChatInput
          {...commonChatInputProps}
          onFormSubmit={(e) => {
            // This will be the default form submission from ChatInput
            // It needs to ensure chatId is correctly passed if it's a new chat.
            if (!currentChatId) {
                onNewChat().then(newId => {
                    if (newId) {
                        // handleSubmit from useChat will use its configured `id` and `body`.
                        // We need to ensure that for THIS call, the new `chatId` is used.
                        handleSubmit(e, {
                           options: { // Pass options to override body for this call
                                body: {
                                    apiKey: getApiKeyForProvider(getProviderForModel(currentModel)),
                                    model: currentModel,
                                    chatId: newId, // Ensure the new chat ID is part of the request body
                                }
                           }
                        });
                    }
                });
            } else {
                // If chat ID exists, handleSubmit uses its default configured body
                handleSubmit(e);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-error text-error-content p-2 text-center">
            Error: {error.message}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {displayMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={{
                id: message.id,
                content: message.content,
                role: message.role as "user" | "assistant",
                timestamp: message.timestamp,
                model: message.model || (message.role === 'assistant' ? currentModel : undefined)
            }}
            onCopy={handleCopyMessage}
            onRegenerate={
              message.role === "assistant" && messages.length > 0 && messages[messages.length -1].id === message.id
                ? handleRegenerate
                : undefined
            }
          />
        ))}

        {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && (
          <div className="flex gap-4 p-6 bg-base-200/50">
            <div className="flex-shrink-0">
              <div className={'w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
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
        {...commonChatInputProps}
        onFormSubmit={handleSubmit} // For existing chats, handleSubmit uses configured body
      />
    </div>
  );
}

export default Chat;
