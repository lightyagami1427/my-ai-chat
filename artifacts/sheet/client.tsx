"use client";

import { SparklesIcon } from "@/components/icons";

type ToolbarActionProps = {
  sendMessage: (message: any) => void;
};

export const sheetToolbarActions = [
  {
    icon: <SparklesIcon />,
    onClick: ({ sendMessage }: ToolbarActionProps) => {
      sendMessage({
        role: "user",
        content: "",
        parts: [
          {
            type: "text",
            text: "Can you please format and clean the data?",
          },
        ],
      });
    },
  },
];
