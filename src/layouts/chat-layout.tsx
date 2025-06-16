import React, { useState } from "react";
import { Outlet } from "react-router";
import { Header, Sidebar } from "../components";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  model: string;
}

function ChatLayout() {
  const [currentModel, setCurrentModel] = useState("gpt-4");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Getting started with React",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      model: "GPT-4",
    },
    {
      id: "2",
      title: "JavaScript best practices",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      model: "Claude 3",
    },
    {
      id: "3",
      title: "CSS Grid vs Flexbox",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      model: "GPT-3.5 Turbo",
    },
  ]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New conversation",
      timestamp: new Date(),
      model: currentModel,
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleChatDelete = (chatId: string) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onChatDelete={handleChatDelete}
          isOpen={isSidebarOpen}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            onNewChat={handleNewChat}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
          <Outlet
            context={{
              currentModel,
              currentChatId,
              chats,
              onNewChat: handleNewChat,
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default ChatLayout;
