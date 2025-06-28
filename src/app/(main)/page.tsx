import { WelcomeScreen, ChatInput } from "@/components";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <WelcomeScreen />
      <ChatInput />
    </div>
  );
}
