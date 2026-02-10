"use server";

import { generateText } from "ai";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bedrock } from "@ai-sdk/amazon-bedrock";

import {
  deleteChatById,
  getChatById,
  saveChat,
  updateChatVisibilityById,
  deleteMessagesAfterMessageId,
} from "@/lib/db/queries";
import type { UIMessage } from "@/lib/types";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    const { text: title } = await generateText({
      // FIX: Use the "us." prefix for Opus On-Demand
      model: bedrock("us.anthropic.claude-3-haiku-20240307-v1:0"),
      system: `\n
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });

    return title;
  } catch (error) {
    console.error("Failed to generate title:", error);
    return "New Chat";
  }
}

export async function deleteChat({ id }: { id: string }) {
  const chat = await getChatById({ id });
  if (!chat) return;
  await deleteChatById({ id });
  redirect("/");
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  await updateChatVisibilityById({ chatId, visibility });
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    if (typeof deleteMessagesAfterMessageId === "function") {
      await deleteMessagesAfterMessageId({ id });
    }
  } catch (error) {
    console.error("Failed to delete trailing messages:", error);
  }
}