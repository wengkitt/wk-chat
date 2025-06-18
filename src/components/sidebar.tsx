import { Link } from "react-router-dom";
import { Doc } from "../../convex/_generated/dataModel"; // Adjusted path

interface SidebarProps {
  chats: Doc<"chats">[];
  currentChatId: string | null;
  onNewChat: () => void; // Function to call when "New Chat" is clicked
  isCreatingChat: boolean;
}

const Sidebar = ({ chats, currentChatId, onNewChat, isCreatingChat }: SidebarProps) => {
  return (
    <div className="w-64 bg-base-300 text-base-content flex flex-col">
      <div className="p-4">
        <button
          className="btn btn-primary w-full"
          onClick={onNewChat}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <>
              <span className="loading loading-spinner"></span>
              Creating...
            </>
          ) : (
            "New Chat"
          )}
        </button>
      </div>
      <ul className="menu menu-sm flex-grow overflow-y-auto">
        {chats.length === 0 && !isCreatingChat && (
          <li className="menu-title px-4">No chats yet.</li>
        )}
        {isCreatingChat && chats.length === 0 && (
            <li className="menu-title px-4">
                <span className="loading loading-spinner loading-xs mr-2"></span>
                Loading chats...
            </li>
        )}
        {chats.map((chat) => (
          <li key={chat._id}>
            <Link
              to={`/chat/${chat._id}`}
              className={`${currentChatId === chat._id ? "active" : ""}`}
            >
              {chat.name || `Chat ${new Date(chat.createdAt).toLocaleTimeString()}`}
            </Link>
          </li>
        ))}
      </ul>
      {/* Optional: Add a footer or user section here */}
      {/* <div className="p-4 border-t border-base-100">User Profile / Settings</div> */}
    </div>
  );
};

export default Sidebar;
