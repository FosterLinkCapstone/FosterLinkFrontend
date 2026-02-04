import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { threadApi } from "../../backend/api/ThreadApi";
import { useAuth } from "../../backend/AuthContext";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CircleX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";


export const CreateThreadCardWide = ({onCancel, onCreate}: {onCancel: () => void, onCreate: (thread: ThreadModel) => void}) => {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [tags, setTags] = useState<string[]>([])
  const [tagFieldText, setTagFieldText] = useState<string>('')
  const [showErrorTooltip, setShowErrorTooltip] = useState<boolean>(false)
  const [errorTooltipText, setErrorTooltipText] = useState<string>('')
  const [createLoading, setCreateLoading] = useState<boolean>(false)
  const auth = useAuth()
  const threadApiRef = threadApi(auth)

    const createThread = () => {
      if (title === '') {
        setError("Please enter a title!");
        return;
      }
      if (content === '') {
        setError("Please enter some content!");
        return;
      }
      setError('');
      setFieldErrors({});
      setCreateLoading(true);
      threadApiRef.createThread(title, content, tags)
        .then(res => {
          if (res.thread) onCreate(res.thread);
          else {
            setError(res.error ?? 'Failed to create thread');
            if (res.validationErrors) {
              const next: {[key: string]: string} = {};
              res.validationErrors.forEach(e => { next[e.field] = e.message; });
              setFieldErrors(next);
            }
          }
        })
        .finally(() => {
            setCreateLoading(false)
        });
    }
    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag != tagToRemove));
    }
    const onTagTextChange = (value: string) => {
      // Clear tooltip when user starts typing again
      if (showErrorTooltip) {
        setShowErrorTooltip(false);
      }
      if (value.endsWith(',') || value.endsWith(' ')) {
          const newTag = value.slice(0, -1).trim();
          if (newTag !== '') {
            if (newTag.length < 20) {
              if (tags.length < 10) {
              if (!tags.includes(newTag)) {
                  setTags([...tags, newTag]);
                  setTagFieldText('');
              } else {
                  setErrorTooltipText("This tag already exists");
                  // Tag already exists, show tooltip
                  setShowErrorTooltip(true);
                  setTagFieldText('');
                  // Hide tooltip after 3 seconds
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
    <Card 
      className="flex overflow-hidden border border-border"
    >
      <div className="flex flex-col items-center p-6 border-r gap-6 border-border bg-muted/50 min-w-[180px]">
        <div className="w-full grid gap-2">
          <Input
            type="text"
            placeholder="Enter title"
            id="new-thread-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
          <span className="text-red-500">{fieldErrors["title"]}</span>
        </div>
        <div className="w-full grid gap-2">
          <Textarea
            placeholder="Enter post content"
            id="new-thread-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[200px]"
          />
          <span className="text-red-500">{fieldErrors["content"]}</span>
        </div>
        <TooltipProvider>
          <InputGroup>
            <Tooltip open={showErrorTooltip}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <InputGroupInput placeholder="Enter tags..." value={tagFieldText} onChange={e => onTagTextChange(e.target.value)}/>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground" align="start">
                <p>{errorTooltipText}</p>
              </TooltipContent>
            </Tooltip>
            <InputGroupAddon>
              {
              tags.map((tag, i) => {
                return <Badge key={i} variant="default" title="Click to remove" className="cursor-pointer bg-primary text-primary-foreground" onClick={() =>removeTag(tag)}>{tag}&nbsp;<CircleX/></Badge>
              })
              }
            </InputGroupAddon>
          </InputGroup>
        </TooltipProvider>
        {
            error != "" &&
            <h3 className="text-l font-semibold mb-2 text-destructive">{error}</h3>

        }
        <div className="w-full flex flex-row align-center gap-2 justify-center">
            <Button type="button" className="w-100 !border-1" onClick={createThread} disabled={createLoading}>{createLoading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Create"}</Button>
            <Button type="button" className="w-100 !border-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
};