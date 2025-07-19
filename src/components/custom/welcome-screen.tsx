"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { examples } from "@/types";

export default function WelcomeScreen() {
  const onExampleClick = (example: string): void => {
    console.log("Example clicked:", example);
  };
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-base-content mb-4">
          Welcome to WK Chat
        </h1>
        <p className="text-lg text-base-content/70">
          Chat with various AI models including GPT-4, Claude, and Gemini.
          Choose your preferred model and start a conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {examples.map((example, index) => (
          <Card
            key={index}
            className="hover:bg-muted transition-colors cursor-pointer text-left"
            onClick={() => onExampleClick(example.description)}
          >
            <CardContent className="flex items-start gap-4 px-4 py-2">
              <div className="text-2xl">{example.icon}</div>
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold mb-1">
                  {example.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {example.description}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-base-content/60">
        <p>
          💡 <strong>Tip:</strong> You can switch between different AI models
          anytime.
        </p>
      </div>
    </div>
  );
}
