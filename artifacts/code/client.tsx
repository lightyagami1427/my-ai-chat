import { toast } from "sonner";
import { CodeEditor } from "@/components/code-editor";
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from "@/components/console";
import { Artifact } from "@/components/create-artifact";
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/icons";
import { generateUUID } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Output handlers (strongly typed)                                    */
/* ------------------------------------------------------------------ */

const OUTPUT_HANDLERS = {
  basic: `# Basic output capture setup`,
  matplotlib: `
import io
import base64
from matplotlib import pyplot as plt

plt.clf()
plt.close('all')
plt.switch_backend('agg')

def setup_matplotlib_output():
    def custom_show():
        if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
            print("Warning: Plot size too large, reducing quality")
            plt.gcf().set_dpi(100)

        png_buf = io.BytesIO()
        plt.savefig(png_buf, format='png')
        png_buf.seek(0)
        png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
        print(f'data:image/png;base64,{png_base64}')
        png_buf.close()
        plt.clf()
        plt.close('all')
    plt.show = custom_show
`,
} as const;

type OutputHandlerKey = keyof typeof OUTPUT_HANDLERS;

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function detectRequiredHandlers(code: string): OutputHandlerKey[] {
  const handlers: OutputHandlerKey[] = ["basic"];

  if (code.includes("matplotlib") || code.includes("plt.")) {
    handlers.push("matplotlib");
  }

  return handlers;
}

type Metadata = {
  outputs: ConsoleOutput[];
};

/* ------------------------------------------------------------------ */
/* Artifact                                                            */
/* ------------------------------------------------------------------ */

export const codeArtifact = new Artifact<"code", Metadata>({
  kind: "code",
  description:
    "Useful for code generation; Code execution is only available for python code.",

  initialize: ({ setMetadata }) => {
    setMetadata({ outputs: [] });
  },

  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-codeDelta") {
      setArtifact((draft) => ({
        ...draft,
        content: streamPart.data,
        isVisible:
          draft.status === "streaming" &&
          draft.content.length > 300 &&
          draft.content.length < 310
            ? true
            : draft.isVisible,
        status: "streaming",
      }));
    }
  },

  content: ({ metadata, setMetadata, ...props }) => (
    <>
      <div className="px-1">
        <CodeEditor {...props} />
      </div>

      {metadata.outputs.length > 0 && (
        <Console
          consoleOutputs={metadata.outputs}
          setConsoleOutputs={() =>
            setMetadata({ ...metadata, outputs: [] })
          }
        />
      )}
    </>
  ),

  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: "Run",
      description: "Execute code",
      onClick: async ({ content, setMetadata }) => {
        const runId = generateUUID();
        const outputContent: ConsoleOutputContent[] = [];

        setMetadata((m) => ({
          ...m,
          outputs: [
            ...m.outputs,
            { id: runId, contents: [], status: "in_progress" },
          ],
        }));

        try {
          // @ts-expect-error pyodide is global
          const pyodide = await globalThis.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });

          pyodide.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith("data:image/png;base64")
                  ? "image"
                  : "text",
                value: output,
              });
            },
          });

          await pyodide.loadPackagesFromImports(content, {
            messageCallback: (message: string) => {
              setMetadata((m) => ({
                ...m,
                outputs: [
                  ...m.outputs.filter((o) => o.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: "text", value: message }],
                    status: "loading_packages",
                  },
                ],
              }));
            },
          });

          const requiredHandlers = detectRequiredHandlers(content);

          for (const handler of requiredHandlers) {
            await pyodide.runPythonAsync(OUTPUT_HANDLERS[handler]);

            if (handler === "matplotlib") {
              await pyodide.runPythonAsync("setup_matplotlib_output()");
            }
          }

          await pyodide.runPythonAsync(content);

          setMetadata((m) => ({
            ...m,
            outputs: [
              ...m.outputs.filter((o) => o.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: "completed",
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((m) => ({
            ...m,
            outputs: [
              ...m.outputs.filter((o) => o.id !== runId),
              {
                id: runId,
                contents: [{ type: "text", value: error.message }],
                status: "failed",
              },
            ],
          }));
        }
      },
    },

    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => handleVersionChange("prev"),
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },

    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => handleVersionChange("next"),
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },

    {
      icon: <CopyIcon size={18} />,
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],

  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Add comments",
      onClick: ({ sendMessage }) =>
        sendMessage({
          role: "user",
          content: "",
          parts: [
            {
              type: "text",
              text: "Add comments to the code snippet for understanding",
            },
          ],
        }),
    },
    {
      icon: <LogsIcon />,
      description: "Add logs",
      onClick: ({ sendMessage }) =>
        sendMessage({
          role: "user",
          content: "",
          parts: [
            {
              type: "text",
              text: "Add logs to the code snippet for debugging",
            },
          ],
        }),
    },
  ],
});
