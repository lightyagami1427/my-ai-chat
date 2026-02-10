export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data';
  content: string;
  createdAt?: Date;
  name?: string;
  toolInvocations?: any[];
}

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: Message[];
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

export interface UIMessage extends Message {
  parts?: any[];
  display?: React.ReactNode;
}

// Ensure role includes 'data' here
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'data' | 'system';
  content: string;
  parts?: any[];
}