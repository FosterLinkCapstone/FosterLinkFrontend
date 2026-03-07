import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { CircleX } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface TagInputFieldProps {
    inputTags: string[];
    onTagsChange: (tags: string[]) => void;
    loading: boolean;
    /** Applied to the wrapper so the parent controls layout/sizing (e.g. width, min-height). */
    className?: string;
    /** Optional content rendered after the input inside the tag row (e.g. a Done button). */
    actions?: React.ReactNode;
}

export const TagInputField = ({ inputTags, onTagsChange, loading, className, actions }: TagInputFieldProps) => {

    const [tagFieldText, setTagFieldText] = useState<string>('')
    const [showErrorTooltip, setShowErrorTooltip] = useState<boolean>(false)
    const [errorTooltipText, setErrorTooltipText] = useState<string>('')

    const removeTag = (tagToRemove: string) => {
        if (loading) return; // avoid race condition
        onTagsChange(inputTags.filter(tag => tag !== tagToRemove));
    }
    const onTagTextChange = (value: string) => {
        if (loading) return; // avoid race condition
      if (showErrorTooltip) {
        setShowErrorTooltip(false);
      }
      if (value.endsWith(',') || value.endsWith(' ')) {
          const newTag = value.slice(0, -1).trim();
          if (newTag !== '') {
            if (newTag.length < 20) {
              if (inputTags.length < 10) {
              if (!inputTags.includes(newTag)) {
                  onTagsChange([...inputTags, newTag]);
                  setTagFieldText('');
              } else {
                  setErrorTooltipText("This tag already exists");
                  setShowErrorTooltip(true);
                  setTagFieldText('');
                  setTimeout(() => setShowErrorTooltip(false), 3000);
              }
            } else {
              setErrorTooltipText("You can only add up to 10 tags");
              setShowErrorTooltip(true);
              setTimeout(() => setShowErrorTooltip(false), 3000);
            }
            } else {
              setErrorTooltipText("Tag is too long (max 20 characters)");
              setShowErrorTooltip(true);
              setTimeout(() => setShowErrorTooltip(false), 3000);
            }
          }
      } else {
          setTagFieldText(value);
      }
    }

    return (
        <TooltipProvider>
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-1.5 gap-y-1.5 px-3 py-1.5",
              "w-full min-w-0 rounded-md border border-input shadow-xs",
              "bg-transparent dark:bg-input/30",
              "transition-[color,box-shadow]",
              "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
              className
            )}
          >
            {inputTags.map((tag, i) => (
              <Badge key={i} variant="secondary" title="Click to remove" className="cursor-pointer shrink-0 text-xs transition-colors hover:bg-destructive/15 hover:text-destructive" onClick={() => removeTag(tag)}>
                {tag}&nbsp;<CircleX className="size-3"/>
              </Badge>
            ))}
            <Tooltip open={showErrorTooltip}>
              <TooltipTrigger asChild>
                <input
                  placeholder="Enter tags..."
                  value={tagFieldText}
                  onChange={e => onTagTextChange(e.target.value)}
                  className="flex-1 min-w-[8rem] h-6 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground" align="start">
                <p>{errorTooltipText}</p>
              </TooltipContent>
            </Tooltip>
            {actions}
          </div>
        </TooltipProvider>
    )

}
