import { DisplayChat } from "@/types";
import {
  ChevronDown,
  FileDown,
  KeyRound,
  LogOut,
  MessageCircleMore,
  Plus,
  Trash,
  User,
  UserCog,
  UserRound,
} from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  chats: DisplayChat[]; // Use DisplayChat type
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  onNewChat: () => void;
  // isOpen: boolean; // Assuming this is removed as Sidebar is conditionally rendered
}

function Sidebar({
  chats,
  currentChatId,
  onChatSelect,
  onChatDelete,
  onNewChat,
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
  }, {} as Record<string, DisplayChat[]>);

  return (
    <aside className="w-80 bg-base-200 border-r border-base-300 flex flex-col">
      <Link href={"/"} className="p-4 border-b border-base-300">
        <h2 className="font-semibold text-base-content flex items-center gap-2">
          <MessageCircleMore className="w-5 h-5" />
          WK Chat
        </h2>
      </Link>
      <div className="p-4 border-b border-base-300">
        <button onClick={onNewChat} className="btn btn-primary w-full mb-4">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </button>
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
                      onChatDelete(chat.id as string);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center py-8 text-base-content/60">
            <MessageCircleMore className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>
      {/* Profile Section at Bottom */}
      <div className="border-t border-base-300 p-4">
        <div className="dropdown dropdown-top dropdown-end w-full">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost w-full justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">User Profile</div>
              <div className="text-xs text-base-content/60">Manage account</div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow-lg border border-base-300 mb-2"
          >
            <li>
              <a className="flex items-center gap-3">
                <UserCog className="w-4 h-4" />
                Profile Settings
              </a>
            </li>
            <li>
              <Link href="/api-keys" className="flex items-center gap-3">
                <KeyRound className="w-4 h-4" />
                API Keys
              </Link>
            </li>
            <li>
              <a className="flex items-center gap-3">
                <FileDown className="w-4 h-4" />
                Export Chats
              </a>
            </li>
            <li></li>
            <li>
              <a className="flex items-center gap-3 text-error">
                <LogOut className="w-4 h-4" />
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
