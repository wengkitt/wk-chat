import ChatInput from "@/components/custom/chat-input";
import WelcomeScreen from "@/components/custom/welcome-screen";

export default function Main() {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 flex items-center justify-center p-8">
        <WelcomeScreen />
      </div>
      <div className="sticky bottom-0">
        <ChatInput />
      </div>
    </div>
  );
}
