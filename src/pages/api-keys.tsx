import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface ApiKey {
  provider: string;
  name: string;
  key: string;
  isValid?: boolean;
  lastUsed?: Date;
}

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    description: "GPT-4, GPT-3.5 Turbo",
    placeholder: "sk-...",
    helpText: "Get your API key from https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "🧠",
    description: "Claude 3",
    placeholder: "sk-ant-...",
    helpText: "Get your API key from https://console.anthropic.com/",
  },
  {
    id: "google",
    name: "Google AI",
    icon: "🔍",
    description: "Gemini Pro",
    placeholder: "AIza...",
    helpText: "Get your API key from https://makersuite.google.com/app/apikey",
  },
];

function ApiKeys() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState("");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem("wk-chat-api-keys");
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error("Failed to load API keys:", error);
      }
    }
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    if (apiKeys.length > 0) {
      localStorage.setItem("wk-chat-api-keys", JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const handleSaveKey = async (providerId: string) => {
    if (!tempKey.trim()) return;

    setIsValidating({ ...isValidating, [providerId]: true });

    // Simulate API key validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const provider = providers.find((p) => p.id === providerId);
    const newKey: ApiKey = {
      provider: providerId,
      name: provider?.name || providerId,
      key: tempKey.trim(),
      isValid: true, // In real implementation, validate against the actual API
      lastUsed: new Date(),
    };

    setApiKeys((prev) => {
      const existing = prev.findIndex((k) => k.provider === providerId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newKey;
        return updated;
      }
      return [...prev, newKey];
    });

    setEditingProvider(null);
    setTempKey("");
    setIsValidating({ ...isValidating, [providerId]: false });
  };

  const handleDeleteKey = (providerId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.provider !== providerId));
    if (editingProvider === providerId) {
      setEditingProvider(null);
      setTempKey("");
    }
  };

  const handleEditKey = (providerId: string) => {
    const existingKey = apiKeys.find((k) => k.provider === providerId);
    setEditingProvider(providerId);
    setTempKey(existingKey?.key || "");
  };

  const toggleShowKey = (providerId: string) => {
    setShowKey((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "*".repeat(key.length);
    return (
      key.substring(0, 4) +
      "*".repeat(key.length - 8) +
      key.substring(key.length - 4)
    );
  };

  const getKeyForProvider = (providerId: string) => {
    return apiKeys.find((k) => k.provider === providerId);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost btn-circle"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-base-content">API Keys</h1>
            <p className="text-base-content/70 mt-1">
              Manage your API keys for different AI providers
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="alert alert-info mb-6">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Bring Your Own Key (BYOK)</h3>
            <div className="text-sm">
              Your API keys are stored locally in your browser and never sent to
              our servers. You'll need valid API keys to use the respective AI
              models.
            </div>
          </div>
        </div>

        {/* API Key Cards */}
        <div className="grid gap-6">
          {providers.map((provider) => {
            const existingKey = getKeyForProvider(provider.id);
            const isEditing = editingProvider === provider.id;
            const isValidatingKey = isValidating[provider.id];

            return (
              <div key={provider.id} className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h3 className="card-title text-lg">{provider.name}</h3>
                        <p className="text-sm text-base-content/70">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingKey && (
                        <div className="badge badge-success gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Connected
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">API Key</span>
                        </label>
                        <input
                          type="password"
                          placeholder={provider.placeholder}
                          className="input input-bordered w-full"
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          disabled={isValidatingKey}
                        />
                        <label className="label">
                          <span className="label-text-alt text-info">
                            {provider.helpText}
                          </span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveKey(provider.id)}
                          className="btn btn-primary btn-sm"
                          disabled={!tempKey.trim() || isValidatingKey}
                        >
                          {isValidatingKey && (
                            <span className="loading loading-spinner loading-xs"></span>
                          )}
                          {isValidatingKey ? "Validating..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProvider(null);
                            setTempKey("");
                          }}
                          className="btn btn-ghost btn-sm"
                          disabled={isValidatingKey}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : existingKey ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <code className="bg-base-300 px-3 py-2 rounded text-sm flex-1">
                          {showKey[provider.id]
                            ? existingKey.key
                            : maskKey(existingKey.key)}
                        </code>
                        <button
                          onClick={() => toggleShowKey(provider.id)}
                          className="btn btn-ghost btn-sm btn-square"
                          title={showKey[provider.id] ? "Hide key" : "Show key"}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {showKey[provider.id] ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            )}
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-base-content/60">
                          Last used:{" "}
                          {existingKey.lastUsed?.toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditKey(provider.id)}
                            className="btn btn-ghost btn-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteKey(provider.id)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <button
                        onClick={() => handleEditKey(provider.id)}
                        className="btn btn-outline btn-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add API Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="alert alert-warning mt-8">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Security Notice</h3>
            <div className="text-sm">
              Keep your API keys secure and never share them publicly. Monitor
              your usage on the respective provider dashboards to track costs
              and usage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeys;
