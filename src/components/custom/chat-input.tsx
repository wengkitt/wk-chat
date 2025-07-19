"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import Loader from "./loader";
import ModelSelector from "./model-selector";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getProviderForModel, hasApiKeyForProvider } from "@/lib/api-keys";
import { useRouter } from "next/navigation";

interface ChatInputProps {
  chatId?: Id<"chats">; // Optional chatId for creating new chats
}

export default function ChatInput({ chatId: currentChatId }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>("");
  const models = useQuery(api.models.getModels);
  const createChat = useMutation(api.chats.createChat);
  const updateChat = useMutation(api.chats.updateChat);
  const isModelsLoading = !models;

  // On mount or when models change, restore model from localStorage if valid
  useEffect(() => {
    if (models && models.length > 0) {
      const savedModel =
        typeof window !== "undefined"
          ? localStorage.getItem("selectedModel")
          : null;
      const validModel = models.find((m) => m.name === savedModel);
      if (savedModel && validModel) {
        setCurrentModel(savedModel);
      } else {
        const defaultModel =
          models.find((m) => m.isDefault)?.name || models[0].name;
        setCurrentModel(defaultModel);
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedModel", defaultModel);
        }
      }
    }
  }, [models]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const provider = getProviderForModel(currentModel);
    if (!hasApiKeyForProvider(provider)) {
      const modelInfo = models?.find((m) => m.name === currentModel);
      const shouldRedirect = confirm(
        `You need to add an API key for ${modelInfo?.provider} to use this model. Would you like to add one now?`
      );
      if (shouldRedirect) {
        router.push("/api-keys");
      }
      return;
    }

    if (!currentChatId) {
      setIsLoading(true);
      createChat({
        title: `New Chat`,
        message: inputValue,
        model: currentModel,
      }).then(({ chatId }) => {
        if (chatId) {
          setIsLoading(false);
          setInputValue("");
          router.push(`/chat/${chatId}`);
        }
      });
    } else {
      updateChat({
        chatId: currentChatId,
        message: inputValue,
        model: currentModel,
      }).then(() => {
        setIsLoading(false);
        setInputValue("");
      });
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Persist currentModel to localStorage when changed
  useEffect(() => {
    if (currentModel && typeof window !== "undefined") {
      localStorage.setItem("selectedModel", currentModel);
    }
  }, [currentModel]);

  const currentProvider = models ? getProviderForModel(currentModel) : null;
  const hasRequiredApiKey = currentProvider
    ? hasApiKeyForProvider(currentProvider)
    : true;

  // Handle Enter/Shift+Enter in textarea
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Manually trigger form submit
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
    // else allow default (newline)
  };

  return (
    <div className="bg-transparent">
      {!hasRequiredApiKey && (
        <Alert variant={"destructive"} className="mb-4 max-w-4xl mx-auto">
          <TriangleAlert />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            You need to add an API key for{" "}
            {models?.find((m: Doc<"models">) => m.name === currentModel)
              ?.provider || "provider"}{" "}
            to use this model.
            <a className="underline">Add API Key</a>
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <Card className="gap-0 p-2 shadow-none">
          <CardContent className="p-0 pb-1">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                hasRequiredApiKey
                  ? "Type your message..."
                  : "Add an API key to start chatting..."
              }
              disabled={isLoading || !hasRequiredApiKey || isModelsLoading}
              rows={1}
              className={`min-h-[60px] max-h-[100px] resize-none text-base border-none shadow-none focus-visible:ring-0 ${
                isModelsLoading ? "animate-pulse" : ""
              }`}
            />
          </CardContent>
          <CardFooter className="p-0">
            <div className="flex flex-row w-full items-center justify-between text-xs text-muted-foreground">
              <div className="flex flex-row items-center gap-0">
                {isModelsLoading ? (
                  <Loader size="xs" className="mr-1" />
                ) : (
                  <ModelSelector
                    models={models || []}
                    currentModel={currentModel}
                    setCurrentModel={setCurrentModel}
                  />
                )}
                <span className="ml-1 hidden sm:inline">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>
              <div className="flex items-end">
                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <Button
                    type="submit"
                    variant="default"
                    disabled={
                      !inputValue.trim() ||
                      isLoading ||
                      !hasRequiredApiKey ||
                      isModelsLoading
                    }
                    size="icon"
                  >
                    <ArrowUp />
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      </form>
      <span className="block text-xs text-muted-foreground text-center mt-2">
        AI generated content can make mistakes. Check important info.
      </span>
    </div>
  );
}
