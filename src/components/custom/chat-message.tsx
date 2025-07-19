"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import MessageBubble from "./message-bubble";

interface ChatMessagesProps {
  chatId: Id<"chats">;
}

function ChatMessages({ chatId }: ChatMessagesProps) {
  const messages = useQuery(api.messages.getMessagesForChat, { chatId });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const checkIfShouldShowButton = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
    const contentExceedsViewport = scrollHeight > clientHeight;
    setShowScrollButton(isNotAtBottom && contentExceedsViewport);
  }, []);

  function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number
  ) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const debouncedCheckIfShouldShowButton = useMemo(
    () => debounce(checkIfShouldShowButton, 100),
    [checkIfShouldShowButton]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", debouncedCheckIfShouldShowButton);
      return () =>
        container.removeEventListener(
          "scroll",
          debouncedCheckIfShouldShowButton
        );
    }
  }, [debouncedCheckIfShouldShowButton]);

  useEffect(() => {
    checkIfShouldShowButton();
  }, [messages, checkIfShouldShowButton]);

  const userMsgCountRef = useRef<number>(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (
      userMessages.length > 2 &&
      userMessages.length > userMsgCountRef.current
    ) {
      scrollToBottom();
    }
    userMsgCountRef.current = userMessages.length;
  }, [messages, scrollToBottom]);

  const renderedMessages = useMemo(() => {
    return messages?.map((msg) => (
      <MessageBubble
        key={msg._id}
        message={{
          id: msg._id,
          timestamp: new Date(msg._creationTime),
          content: msg.content,
          model: msg.model,
          role: msg.role,
        }}
      />
    ));
  }, [messages]);

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <div
      className="h-full overflow-y-auto relative scroll-smooth"
      ref={containerRef}
    >
      <div className="max-w-4xl mx-auto pb-24">
        {renderedMessages}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && (
        <div className="sticky bottom-2 left-0 right-0 flex justify-center">
          <Button
            size="xs"
            onClick={handleScrollToBottom}
            className="rounded-full"
            variant="default"
          >
            Scroll to bottom
            <ChevronDown />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;
