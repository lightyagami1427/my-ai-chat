import { Artifact } from "@/components/create-artifact";
import { 
  CopyIcon, 
  MessageSquareIcon, 
  PenIcon,
  SparklesIcon 
} from "lucide-react";
import { toast } from "sonner";

export const textArtifact = new Artifact<"text", {}>({
  kind: "text",
  description: "Useful for text generation, editing, and formatting.",

  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-textDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },

  content: ({ content }) => {
    return (
      <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap break-words dark:text-zinc-100">
        {content}
      </div>
    );
  },

  actions: [
    {
      icon: <CopyIcon size={18} />,
      label: "Copy",
      description: "Copy text to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],

  toolbar: [
    {
      icon: <PenIcon size={18} />,
      description: "Fix grammar and spelling",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          content: "", 
          parts: [
            {
              type: "text",
              text: "Please fix the grammar and spelling in this text.",
            },
          ],
        });
      },
    },
    {
      icon: <MessageSquareIcon size={18} />,
      description: "Simplify language",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          content: "",
          parts: [
            {
              type: "text",
              text: "Can you simplify the language in this text?",
            },
          ],
        });
      },
    },
    {
      icon: <SparklesIcon size={18} />,
      description: "Add final polish",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          content: "",
          parts: [
            {
              type: "text",
              text: "Add some professional polish to this text.",
            },
          ],
        });
      },
    },
  ],
});