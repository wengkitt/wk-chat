"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProviderForModel, hasApiKeyForProvider } from "@/lib/api-keys";
import { Doc } from "../../../convex/_generated/dataModel";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          title="Select AI Model"
        >
          <Brain />
          <span className="hidden sm:inline text-xs font-semibold">
            {models.find((m) => m.name === currentModel)?.displayName ||
              "Select Model"}
          </span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-64 max-w-[90vw] space-y-1 p-2"
      >
        {models.map((model) => {
          const modelProvider = getProviderForModel(model.name);
          const hasKey = hasApiKeyForProvider(modelProvider);
          const isSelected = currentModel === model.name;

          return (
            <DropdownMenuItem
              key={model._id}
              onSelect={() => hasKey && setCurrentModel(model.name)}
              disabled={!hasKey}
              className={cn(
                "flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isSelected && "bg-primary/10 text-primary font-semibold",
                !hasKey && "opacity-60 cursor-not-allowed"
              )}
              title={
                !hasKey
                  ? "API key required for this model"
                  : model.displayName || model.name
              }
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center gap-2 truncate">
                  {model.displayName || model.name}
                  {!hasKey && (
                    <span className="relative group">
                      <TriangleAlert className="w-3 h-3 text-warning" />
                      <span className="absolute top-6 left-1/2 -translate-x-1/2 z-10 hidden group-hover:block text-warning text-xs bg-muted px-2 py-1 rounded shadow-md whitespace-nowrap">
                        API key required
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {model.provider}
                  {!hasKey && (
                    <span className="text-warning"> • API key required</span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
