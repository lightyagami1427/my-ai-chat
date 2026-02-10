import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";

// Standard V3 Usage Object
const mockUsage = {
  inputTokens: 10,
  outputTokens: 20,
};

export const chatModel = new MockLanguageModelV3({
  doGenerate: async () => {
    return {
      finishReason: "stop",
      usage: mockUsage,
      rawCall: { rawPrompt: null, rawSettings: {} },
      content: [{ type: "text", text: "Hello, world!" }],
      warnings: [],
    } as any; // <--- FIX: Forces TS to accept this object
  },
  doStream: async () => {
    return {
      stream: simulateReadableStream({
        chunkDelayInMs: 50,
        initialDelayInMs: 10,
        chunks: [
          { type: "text-delta", delta: "Hello, ", id: "1" },
          { type: "text-delta", delta: "world!", id: "2" },
          {
            type: "finish",
            finishReason: "stop",
            usage: mockUsage,
          },
        ] as any, // <--- FIX: Forces TS to accept these chunks
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    };
  },
});

export const reasoningModel = new MockLanguageModelV3({
  doGenerate: async () => {
    return {
      finishReason: "stop",
      usage: mockUsage,
      rawCall: { rawPrompt: null, rawSettings: {} },
      content: [{ type: "text", text: "Reasoning complete." }],
      warnings: [],
    } as any;
  },
  doStream: async () => {
    return {
      stream: simulateReadableStream({
        chunkDelayInMs: 50,
        initialDelayInMs: 10,
        chunks: [
          { type: "text-delta", delta: "Reasoning...", id: "1" },
          {
            type: "finish",
            finishReason: "stop",
            usage: mockUsage,
          },
        ] as any,
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    };
  },
});

export const titleModel = new MockLanguageModelV3({
  doGenerate: async () => {
    return {
      finishReason: "stop",
      usage: mockUsage,
      rawCall: { rawPrompt: null, rawSettings: {} },
      content: [{ type: "text", text: "Test Title" }],
      warnings: [],
    } as any;
  },
  doStream: async () => {
    return {
      stream: simulateReadableStream({
        chunkDelayInMs: 50,
        initialDelayInMs: 10,
        chunks: [
          { type: "text-delta", delta: "Test Title", id: "1" },
          {
            type: "finish",
            finishReason: "stop",
            usage: mockUsage,
          },
        ] as any,
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    };
  },
});

export const artifactModel = new MockLanguageModelV3({
  doGenerate: async () => {
    return {
      finishReason: "stop",
      usage: mockUsage,
      rawCall: { rawPrompt: null, rawSettings: {} },
      content: [{ type: "text", text: "Artifact Code" }],
      warnings: [],
    } as any;
  },
  doStream: async () => {
    return {
      stream: simulateReadableStream({
        chunkDelayInMs: 50,
        initialDelayInMs: 10,
        chunks: [
          { type: "text-delta", delta: "Artifact code here", id: "1" },
          {
            type: "finish",
            finishReason: "stop",
            usage: mockUsage,
          },
        ] as any,
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    };
  },
});