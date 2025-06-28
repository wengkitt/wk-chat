import { ChatInput, ChatMessage } from "@/components";
import { Message } from "@/types";

const sampleMessages: Message[] = [
  {
    role: "user",
    content: "Hello! Can you help me write a React component?",
    timestamp: new Date("2025-06-28T13:55:00+08:00"),
    id: "1",
  },
  {
    role: "assistant",
    content:
      "Of course! What kind of component do you need? Please provide some details.",
    timestamp: new Date("2025-06-28T13:55:10+08:00"),
    model: "GPT-4",
    id: "2",
  },
  {
    role: "user",
    content: "I want a chat bubble UI, similar to ChatGPT.",
    timestamp: new Date("2025-06-28T13:55:30+08:00"),
    id: "3",
  },
  {
    role: "assistant",
    content:
      "Great! I can help you with that. Here’s a basic example using React, Tailwind CSS, and DaisyUI.",
    timestamp: new Date("2025-06-28T13:55:45+08:00"),
    model: "GPT-4",
    id: "4",
  },
];

export default async function Chat({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {sampleMessages.map((msg, idx) => (
          <div className="max-w-4xl mx-auto" key={msg.id}>
            <ChatMessage key={idx} message={msg} />
          </div>
        ))}
      </div>

      <ChatInput />
    </div>
  );
}
