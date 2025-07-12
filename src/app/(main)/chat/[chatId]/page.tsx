import { ChatInput, ChatMessage } from "@/components";
import { Id } from "@/../convex/_generated/dataModel";

export default async function Chat({
  params,
}: {
  params: Promise<{ chatId: Id<"chats"> }>;
}) {
  const { chatId } = await params;

  return (
    <div className="flex flex-col h-full">
      <ChatMessage chatId={chatId} />
      <ChatInput chatId={chatId} />
    </div>
  );
}
