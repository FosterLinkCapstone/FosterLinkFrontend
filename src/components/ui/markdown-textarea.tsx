import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const allFormattingExamples = [
  { syntax: "**bold**", description: "Bold", restricted: false },
  { syntax: "*italic*", description: "Italic", restricted: false },
  { syntax: "~~strikethrough~~", description: "Strikethrough", restricted: false },
  { syntax: "`code`", description: "Inline code", restricted: false },
  { syntax: "```code block```", description: "Code block", restricted: true },
  { syntax: "> quote", description: "Blockquote", restricted: false },
  { syntax: "- item", description: "Bullet list", restricted: false },
  { syntax: "# Heading 1", description: "Large heading", restricted: true },
  { syntax: "## Heading 2", description: "Medium heading", restricted: true },
  { syntax: "### Heading 3", description: "Small heading", restricted: true },
];

interface MarkdownTextareaProps extends React.ComponentProps<"textarea"> {
  restricted?: boolean;
}

function MarkdownTextarea({
  className,
  restricted = false,
  ...props
}: MarkdownTextareaProps) {
  const [helpOpen, setHelpOpen] = React.useState(false);
  const value = typeof props.value === "string" ? props.value : "";

  const examples = restricted
    ? allFormattingExamples.filter((ex) => !ex.restricted)
    : allFormattingExamples;

  return (
    <div className="flex flex-col gap-2">
      <Textarea className={className} {...props} />

      <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              helpOpen && "rotate-180"
            )}
          />
          Formatting help
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 rounded-md border border-border bg-muted/50 p-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              {examples.map((ex) => (
                <div key={ex.syntax} className="flex items-center gap-2">
                  <code className="font-mono text-muted-foreground">
                    {ex.syntax}
                  </code>
                  <span className="text-muted-foreground">-</span>
                  <span>{ex.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {value && (
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Preview</p>
          <MarkdownContent
            content={value}
            decodeEntities={false}
            restricted={restricted}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}

export { MarkdownTextarea };
