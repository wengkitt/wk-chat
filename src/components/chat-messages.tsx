"use client";

import { Message } from "@/types";
import MessageBubble from "./message-bubble";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ChatMessagesProps {
  chatId: Id<"chats">;
}

function ChatMessages({ chatId }: ChatMessagesProps) {
  const messages = useQuery(api.messages.getMessagesForChat, { chatId });
  return (
    <div className="flex-1 overflow-y-auto">
      {messages &&
        messages.map((msg, idx) => (
          <div className="max-w-4xl mx-auto" key={msg._id}>
            <MessageBubble
              key={idx}
              message={
                {
                  id: msg._id,
                  timestamp: new Date(msg._creationTime),
                  content: msg.content,
                  model: msg.model,
                  role: msg.role,
                } as Message
              }
            />
          </div>
        ))}
    </div>
  );
}

export default ChatMessages;
