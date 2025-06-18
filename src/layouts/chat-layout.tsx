import { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjusted path
import { Doc } from "../../convex/_generated/dataModel"; // Adjusted path
import Sidebar from "../components/sidebar";
import Header from "../components/header";

// Define the type for the context passed via Outlet
export interface ChatLayoutContext {
  currentChatId: string | null;
  chats: Doc<"chats">[] | undefined;
  currentModel: string;
  handleNewChat: () => Promise<void>;
  handleModelChange: (model: string) => void;
  isCreatingChat: boolean;
}

const ChatLayout = () => {
  const navigate = useNavigate();
  const { chatId: currentChatIdFromParams } = useParams<{ chatId?: string }>();

  const [currentModel, setCurrentModel] = useState<string>("gpt-4"); // Default model
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const chats = useQuery(api.chat.listChats);
  const createChatMutation = useMutation(api.chat.createChat);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    setCurrentChatId(currentChatIdFromParams || null);
  }, [currentChatIdFromParams]);

  // Effect to handle redirection if no chat ID and no chats exist, or select first chat
  useEffect(() => {
    if (!currentChatId && chats && chats.length > 0) {
      // If no chat is selected but chats exist, navigate to the first one
      navigate(`/chat/${chats[0]._id}`);
    }
    // If no currentChatId and no chats, handleNewChat will be called by button or another effect
  }, [currentChatId, chats, navigate]);


  const handleNewChat = async ()_ => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    try {
      const newChatId = await createChatMutation({ name: "New Chat" }); // Pass an optional name
      navigate(`/chat/${newChatId}`);
      setCurrentChatId(newChatId); // Ensure currentChatId is updated
    } catch (error) {
      console.error("Failed to create new chat:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
  };

  const outletContext: ChatLayoutContext = {
    currentChatId,
    chats,
    currentModel,
    handleNewChat,
    handleModelChange,
    isCreatingChat,
  };

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar
        chats={chats || []}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        isCreatingChat={isCreatingChat}
      />
      <div className="flex flex-col flex-1">
        <Header
          currentModel={currentModel}
          onModelChange={handleModelChange}
          onNewChat={handleNewChat} // Allow header to trigger new chat
          isMobileMenuOpen={false} // Placeholder, manage actual state if needed
          onToggleMobileMenu={() => {}} // Placeholder
        />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;
