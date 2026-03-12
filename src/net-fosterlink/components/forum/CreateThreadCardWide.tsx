import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { threadApi } from "../../backend/api/ThreadApi";
import { useAuth } from "../../backend/AuthContext";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { TagInputField } from "./TagInputField";


export const CreateThreadCardWide = ({onCancel, onCreate}: {onCancel: () => void, onCreate: (thread: ThreadModel) => void}) => {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [tags, setTags] = useState<string[]>([])
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
  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-col items-center p-6 gap-6 w-full">
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
        <TagInputField inputTags={tags} onTagsChange={setTags} loading={false} className="w-full" />
        {
            error != "" &&
            <h3 className="text-l font-semibold mb-2 text-destructive">{error}</h3>
        }
        <div className="w-full flex flex-wrap gap-2">
            <Button type="button" className="flex-1 min-w-[100px]" onClick={createThread} disabled={createLoading || auth.restricted}>{createLoading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Create"}</Button>
            <Button type="button" className="flex-1 min-w-[100px]" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
};