"use client";

import { getProviderForModel, hasApiKeyForProvider } from "@/utils";
import { Brain, ChevronDown, TriangleAlert } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";

interface ModelSelectorProps {
  currentModel: string;
  setCurrentModel: (model: string) => void;
  models: Doc<"models">[];
}

export default function ModelSelector({
  currentModel,
  setCurrentModel,
  models,
}: ModelSelectorProps) {
  return (
    <div className="dropdown dropdown-top">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-xs flex items-center gap-1"
        title="Select AI Model"
      >
        <Brain className="w-4 h-4" />
        <span className="hidden sm:inline">
          {models.find((m) => m.name === currentModel)?.name || "Select Model"}
        </span>
        <ChevronDown className="w-3 h-3" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300 mb-2"
      >
        {models.map((model) => {
          const modelProvider = getProviderForModel(model.name);
          const hasKey = hasApiKeyForProvider(modelProvider);

          return (
            <li key={model.name}>
              <button
                onClick={() => setCurrentModel(model.name)}
                className={`${currentModel === model.name ? "active" : ""} ${
                  !hasKey ? "opacity-50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {model.name}
                    {!hasKey && (
                      <TriangleAlert className="w-3 h-3 text-warning" />
                    )}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {model.provider}
                    {!hasKey && " • API key required"}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
