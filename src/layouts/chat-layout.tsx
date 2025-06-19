import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router"; // Added useNavigate
import { Header, Sidebar } from "../components";
import { useConvexQuery, useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api"; // Path to Convex API
import type { Doc } from "../../convex/_generated/dataModel"; // Type for Convex documents

// Interface for chat objects passed to Sidebar, derived from Convex Doc<"chats">
export interface DisplayChat {
  id: string; // Convex _id
  title: string;
  timestamp: Date; // Convex _creationTime is number, convert to Date
  model: string;   // Convex modelUsed
}

function ChatLayout() {
  const navigate = useNavigate(); // For redirecting after chat creation

  // State for the model selected in the UI, affecting new chats or current interaction model
  const [selectedModel, setSelectedModel] = useState("gpt-4"); // Default model

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch chats from Convex
  const convexChats = useConvexQuery(api.chats.list, {});
  const createChatMutation = useConvexMutation(api.chats.create);
  const deleteChatMutation = useConvexMutation(api.chats.remove);
  const updateChatTitleMutation = useConvexMutation(api.chats.updateTitle);


  // Transform Convex chats for display
  const displayChats: DisplayChat[] = convexChats
    ? convexChats.map((chat: Doc<"chats">) => ({
        id: chat._id,
        title: chat.title,
        timestamp: new Date(chat.createdAt), // Convex _creationTime is createdAt
        model: chat.modelUsed || "Unknown Model",
      }))
    : [];

  // Effect to set currentChatId to the newest chat if none is selected and chats load
  // or after a chat is deleted and currentChatId becomes null.
  useEffect(() => {
    if (!currentChatId && displayChats && displayChats.length > 0) {
      // Default to the first chat in the list (which should be the newest if sorted desc in query)
      // setCurrentChatId(displayChats[0].id);
      // navigate(`/chat/${displayChats[0].id}`); // Optionally navigate
    }
  }, [currentChatId, displayChats, navigate]);


  const handleNewChat = async () => {
    try {
      const newChatTitle = "New Conversation"; // Default title
      const newChatId = await createChatMutation({
        title: newChatTitle,
        modelUsed: selectedModel, // Use the currently selected model for the new chat
      });
      setCurrentChatId(newChatId);
      // Optionally, navigate to the new chat URL if you have routes like /chat/:chatId
      navigate(`/chat/${newChatId}`); // Assuming router is set up for this
      return newChatId;
    } catch (error) {
      console.error("Failed to create new chat:", error);
      return null;
    }
  };

  const handleChatSelect = (chatId: string) => {
    const selected = displayChats.find(c => c.id === chatId);
    if (selected) {
      setCurrentChatId(chatId);
      setSelectedModel(selected.model); // Update selectedModel based on the chat being viewed
      navigate(`/chat/${chatId}`); // Navigate to the chat
    }
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      await deleteChatMutation({ id: chatId });
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        // Optionally navigate to a default page or the next chat
        const remainingChats = displayChats.filter(c => c.id !== chatId);
        if (remainingChats.length > 0) {
          // Select the "newest" (first in current sort order) of remaining.
          // The list will re-render from convexChats, so this logic might be tricky here.
          // Best to let useEffect handle selecting a default if currentChatId becomes null.
          navigate(`/`); // Navigate to home/welcome page
        } else {
          navigate(`/`);
        }
      }
      // The list will automatically update due to Convex's reactivity.
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    // If a chat is active (currentChatId is not null), this change
    // will be reflected in the `body` of the `useChat` hook in Chat.tsx
    // because `currentModel` in its context will update.
  };

  // If currentChatId is set, find the chat and set selectedModel from it.
  // This ensures if we land on a chat URL directly, the model selector shows the correct model.
  useEffect(() => {
    if (currentChatId) {
      const activeChat = displayChats.find(c => c.id === currentChatId);
      if (activeChat && activeChat.model) {
        setSelectedModel(activeChat.model);
      }
    }
  }, [currentChatId, displayChats]);


  return (
    <div className="h-screen flex flex-col bg-base-100">
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && ( // Conditionally render Sidebar based on isSidebarOpen
            <Sidebar
            chats={displayChats}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onChatDelete={handleChatDelete}
            onNewChat={handleNewChat}
            // isOpen={isSidebarOpen} // Sidebar itself might not need this if conditionally rendered
            />
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
          <Outlet
            context={{
              currentModel: selectedModel, // Pass the dynamic selectedModel
              currentChatId,
              onNewChat: handleNewChat,
              onModelChange: handleModelChange,
              // For auto-titling:
              // updateChatTitle: updateChatTitleMutation, // Pass mutation if needed by children
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default ChatLayout;
