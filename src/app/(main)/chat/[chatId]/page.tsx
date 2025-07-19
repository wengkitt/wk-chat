import ChatInput from "@/components/custom/chat-input";
import ChatMessages from "@/components/custom/chat-message";
import { Id } from "../../../../../convex/_generated/dataModel";

export default async function Chat({
  params,
}: {
  params: Promise<{ chatId: Id<"chats"> }>;
}) {
  const { chatId } = await params;
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-hidden">
        <ChatMessages chatId={chatId} />
      </div>
      <div className="sticky bottom-0">
        <ChatInput />
      </div>
    </div>
  );
}
