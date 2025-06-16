import React from "react";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  model: string;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  isOpen: boolean;
}

function Sidebar({
  chats,
  currentChatId,
  onChatSelect,
  onChatDelete,
  isOpen,
}: SidebarProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const groupedChats = chats.reduce((groups, chat) => {
    const timeGroup = formatTime(chat.timestamp);
    if (!groups[timeGroup]) groups[timeGroup] = [];
    groups[timeGroup].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <h2 className="font-semibold text-base-content flex items-center gap-2">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          WK Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedChats).map(([timeGroup, groupChats]) => (
          <div key={timeGroup} className="mb-4">
            <h3 className="text-xs font-semibold text-base-content/60 px-3 py-2 uppercase tracking-wider">
              {timeGroup}
            </h3>
            <div className="space-y-1">
              {groupChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative rounded-lg transition-colors ${
                    currentChatId === chat.id
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-300"
                  }`}
                >
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className="w-full text-left p-3 rounded-lg"
                  >
                    <div className="font-medium text-sm truncate mb-1">
                      {chat.title}
                    </div>
                    <div
                      className={`text-xs ${
                        currentChatId === chat.id
                          ? "text-primary-content/70"
                          : "text-base-content/60"
                      }`}
                    >
                      {chat.model} •{" "}
                      {chat.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatDelete(chat.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center py-8 text-base-content/60">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
