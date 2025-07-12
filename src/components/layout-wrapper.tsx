"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

export default function LayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = async () => {
    console.log("New chat initiated");
  };

  const handleChatSelect = (chatId: string) => {
    console.log("Chat selected:", chatId);
  };

  const handleChatDelete = async (chatId: string) => {
    console.log("Chat deleted:", chatId);
  };
  return (
    <div className="h-screen flex flex-col bg-base-100">
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <Sidebar
            chats={[]}
            currentChatId={currentChatId}
            onChatSelect={handleChatSelect}
            onChatDelete={handleChatDelete}
            onNewChat={handleNewChat}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
