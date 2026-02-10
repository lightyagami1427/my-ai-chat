// Strict Configuration for Claude Opus 4.6

export const DEFAULT_CHAT_MODEL = "anthropic/claude-opus-4.6";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

// We clear all other models so the app never accidentally switches
export const chatModels: ChatModel[] = [
  {
    id: "anthropic/claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description: "Your exclusive custom model.",
  },
];

export const modelsByProvider = {
  anthropic: chatModels,
};