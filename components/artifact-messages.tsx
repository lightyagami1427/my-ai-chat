import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import equal from "fast-deep-equal";
import { type Vote } from "@/lib/db/schema";

import { PreviewMessage } from "./message";
import { useMessages } from "@/hooks/use-messages";

// Simple fallback to ensure build doesn't fail if the file is missing
const ThinkingMessage = () => (
  <div className="flex flex-row gap-2 px-4 w-full md:max-w-2xl text-muted-foreground italic text-sm">
    Thinking...
  </div>
);

type ArtifactMessagesProps = {
  addToolApprovalResponse: any;
  chatId: string;
  status: any;
  votes: Vote[] | undefined;
  messages: Array<any>; 
  setMessages: any;
  regenerate: any;
  isReadonly: boolean;
  artifactStatus: string;
};

function PureArtifactMessages({
  addToolApprovalResponse,
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: ArtifactMessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    status,
  });

  return (
    <div
      className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20"
      ref={messagesContainerRef}
    >
      {messages?.map((message: any, index: number) => (
        <PreviewMessage
          key={message.id || index}
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={chatId}
          isLoading={status === "streaming" && index === messages.length - 1}
          isReadonly={isReadonly}
          message={message}
          regenerate={regenerate}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
          setMessages={setMessages}
          vote={
            votes
              ? votes.find((vote: any) => vote.messageId === message.id)
              : undefined
          }
        />
      ))}

      <AnimatePresence mode="wait">
        {status === "submitted" &&
          !messages?.some((msg: any) =>
            msg.parts?.some(
              (part: any) => "state" in part && part.state === "approval-responded"
            )
          ) && <ThinkingMessage key="thinking" />}
      </AnimatePresence>

      <motion.div
        className="min-h-[24px] min-w-[24px] shrink-0"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
        ref={messagesEndRef}
      />
    </div>
  );
}

function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps
) {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages?.length !== nextProps.messages?.length) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  return true;
}

export const ArtifactMessages = memo(PureArtifactMessages, areEqual);