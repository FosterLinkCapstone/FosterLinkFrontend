import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s/gm, "")
    .replace(/^\d+\.\s/gm, "");
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
  h4: ({ children }) => <h4 className="text-base font-semibold mt-2 mb-1">{children}</h4>,
  h5: ({ children }) => <h5 className="text-sm font-semibold mt-2 mb-1">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-medium mt-2 mb-1 text-muted-foreground">{children}</h6>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className="font-mono text-sm">{children}</code>;
    }
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted rounded-md p-3 overflow-x-auto my-2">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="list-disc ml-6 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-6 my-1">{children}</ol>,
  li: ({ children }) => <li className="my-0.5">{children}</li>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  a: ({ children }) => <span>{children}</span>,
  img: () => null,
};

// Overrides for restricted mode: headings and code blocks render as plain text
const restrictedComponents: Components = {
  ...markdownComponents,
  h1: ({ children }) => <span>{children}</span>,
  h2: ({ children }) => <span>{children}</span>,
  h3: ({ children }) => <span>{children}</span>,
  h4: ({ children }) => <span>{children}</span>,
  h5: ({ children }) => <span>{children}</span>,
  h6: ({ children }) => <span>{children}</span>,
  pre: ({ children }) => <span>{children}</span>,
  code: ({ children }) => <span>{children}</span>,
};

interface MarkdownContentProps {
  content: string;
  className?: string;
  preview?: boolean;
  decodeEntities?: boolean;
  restricted?: boolean;
}

export function MarkdownContent({
  content,
  className,
  preview = false,
  decodeEntities = true,
  restricted = false,
}: MarkdownContentProps) {
  const processed = decodeEntities ? decodeHtmlEntities(content) : content;

  if (preview) {
    return (
      <span className={className}>{stripMarkdown(processed)}</span>
    );
  }

  const plugins = restricted ? [remarkGfm] : [remarkGfm, remarkBreaks];
  const components = restricted ? restrictedComponents : markdownComponents;

  return (
    <div className={cn("text-left", className)}>
      <Markdown remarkPlugins={plugins} components={components}>
        {processed}
      </Markdown>
    </div>
  );
}
