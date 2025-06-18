import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjusted path
import { Doc, Id } from "../../convex/_generated/dataModel"; // Adjusted path
import ChatMessage from "../components/chat-message";
import ChatInput from "../components/chat-input";
import WelcomeScreen from "../components/welcome-screen";
import { ChatLayoutContext } from "../layouts/chat-layout"; // Import the context type

// Define the frontend Message interface
interface Message {
  id: Id<"messages">; // Use Convex Id type
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  timestamp: number; // Store as number (milliseconds since epoch)
}

const ChatPage = () => {
  const { currentChatId, currentModel, handleNewChat, isCreatingChat } = useOutletContext<ChatLayoutContext>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for the current chat
  const fetchedMessages = useQuery(
    api.chat.listMessages,
    currentChatId ? { chatId: currentChatId as Id<"chats"> } : "skip" // Ensure chatId is Id<"chats">
  );

  const sendMessageAction = useAction(api.chat.sendMessage);

  useEffect(() => {
    if (fetchedMessages) {
      const formattedMessages: Message[] = fetchedMessages.map((msg: Doc<"messages">) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        model: msg.model,
        timestamp: msg.timestamp, // Already a number
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]); // Clear messages if no chat is selected or no messages fetched
    }
  }, [fetchedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (inputValue: string) => {
    if (!currentChatId) {
      // This case should ideally be handled by the layout by creating a new chat
      // or disabling the input if no chat is active.
      // For now, let's try to create a new one if input is attempted.
      if (!isCreatingChat) {
        console.log("No active chat. Attempting to create a new one.");
        await handleNewChat(); // This will navigate and set currentChatId
        // User will need to resend the message in the new chat.
        // Or, we could queue the message and send it once new chat ID is available.
        // For simplicity, we'll rely on user resending for now.
      }
      return;
    }

    if (inputValue.trim() === "") return;

    setIsSending(true);

    try {
      // User message is immediately displayed via Convex's optimistic updates
      // if we were to call a mutation directly here.
      // However, since we are calling an action, we wait for the action to save both.

      await sendMessageAction({
        chatId: currentChatId as Id<"chats">, // Ensure type
        content: inputValue,
        model: currentModel,
      });
      // Messages will update via the useQuery subscription
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally, show an error to the user
    } finally {
      setIsSending(false);
    }
  };

  if (!currentChatId && !isCreatingChat) {
    // If there's no chat ID and not in the process of creating one,
    // show a welcome screen or prompt to start a new chat.
    // The ChatLayout also tries to auto-navigate or create, so this might be brief.
    return <WelcomeScreen onNewChat={handleNewChat} isCreatingChat={isCreatingChat} />;
  }

  if (isCreatingChat && !currentChatId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Creating new chat...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-base-300">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isSending || (isCreatingChat && !currentChatId)}
          disabled={isCreatingChat && !currentChatId} // Disable input while initially creating a chat
        />
      </div>
    </div>
  );
};

export default ChatPage;
