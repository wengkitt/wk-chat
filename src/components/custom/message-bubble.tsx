"use client";

import { Message } from "@/types";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import cn from "clsx";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = React.memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-4 px-2 sm:px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex flex-col">
        <div
          className={cn(
            "relative rounded-lg transition-all",
            isUser &&
              "bg-primary text-primary-foreground max-w-[80vw] md:max-w-xl lg:max-w-2xl border px-4 py-2"
          )}
        >
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                code({ node, className, children, ...rest }) {
                  const isInline = node?.tagName !== "code";
                  const match = /language-(\w+)/.exec(className || "");
                  return !isInline && match ? (
                    <div className="relative my-4 rounded-lg border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() =>
                          navigator.clipboard.writeText(String(children))
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <pre className="overflow-x-auto bg-background rounded-lg px-4 pt-3 pb-6 text-sm">
                        <code className={cn(className, "block")} {...rest}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-3 italic my-2">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-6 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-6 space-y-1">{children}</ol>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">{children}</table>
                  </div>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </article>
        </div>

        <div
          className={cn(
            "flex items-center mt-1 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <Button
            onClick={() => handleCopy(message.content)}
            variant="ghost"
            size="sm"
            className="has-[>svg]:px-0 text-sm"
          >
            {copied ? (
              <>
                <Check /> Copied
              </>
            ) : (
              <>
                <Copy /> Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
