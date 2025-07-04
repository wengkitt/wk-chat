"use client";

import { examples } from "@/types";

export default function WelcomeScreen() {
  const onExampleClick = (example: string): void => {
    // You can replace this with any client-side logic you want
    console.log("Example clicked:", example);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
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
            <button
              key={index}
              onClick={() => onExampleClick(example.description)}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6 text-left"
              type="button"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{example.icon}</span>
                <div>
                  <h3 className="font-semibold text-base-content mb-1">
                    {example.title}
                  </h3>
                  <p className="text-sm text-base-content/70">
                    {example.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-sm text-base-content/60">
          <p>
            💡 <strong>Tip:</strong> You can switch between different AI models
            anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
