interface ApiKey {
  provider: string;
  name: string;
  key: string;
  isValid?: boolean;
  lastUsed?: Date;
}

export const getApiKeys = (): ApiKey[] => {
  try {
    const savedKeys = localStorage.getItem("wk-chat-api-keys");
    return savedKeys ? JSON.parse(savedKeys) : [];
  } catch (error) {
    console.error("Failed to load API keys:", error);
    return [];
  }
};

export const getApiKeyForProvider = (provider: string): string | null => {
  const apiKeys = getApiKeys();
  const key = apiKeys.find((k) => k.provider === provider);
  return key?.key || null;
};

export const hasApiKeyForProvider = (provider: string): boolean => {
  return getApiKeyForProvider(provider) !== null;
};

export const updateApiKeyUsage = (provider: string): void => {
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
    "gemini-pro": "google",
  };

  return modelProviderMap[modelId] || "openai";
};
