import { ApiKey } from "@/types";

const isLocalStorageAvailable = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
};

export const getApiKeys = (): ApiKey[] => {
  if (!isLocalStorageAvailable()) return [];
  try {
    const savedKeys = localStorage.getItem("wk-chat-api-keys");
    return savedKeys ? JSON.parse(savedKeys) : [];
  } catch (error) {
    console.error("Failed to load API keys:", error);
    return [];
  }
};

export const getApiKeyForProvider = (provider: string): string | null => {
  if (!isLocalStorageAvailable()) return null;
  const apiKeys = getApiKeys();
  const key = apiKeys.find((k) => k.provider === provider);
  return key?.key || null;
};

export const hasApiKeyForProvider = (provider: string): boolean => {
  if (!isLocalStorageAvailable()) return false;
  return getApiKeyForProvider(provider) !== null;
};

export const updateApiKeyUsage = (provider: string): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    const apiKeys = getApiKeys();
    const keyIndex = apiKeys.findIndex((k) => k.provider === provider);

    if (keyIndex >= 0) {
      apiKeys[keyIndex].lastUsed = new Date();
      localStorage.setItem("wk-chat-api-keys", JSON.stringify(apiKeys));
    }
  } catch (error) {
    console.error("Failed to update API key usage:", error);
  }
};

// Map model IDs to provider IDs
export const getProviderForModel = (modelId: string): string => {
  const modelProviderMap: Record<string, string> = {
    "gpt-4": "openai",
    "gpt-3.5-turbo": "openai",
    "claude-3": "anthropic",
    "gemini-2.5-flash": "google",
  };

  return modelProviderMap[modelId] || "google";
};
