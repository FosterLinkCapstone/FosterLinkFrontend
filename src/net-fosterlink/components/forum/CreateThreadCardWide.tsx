import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { threadApi } from "../../backend/api/ThreadApi";
import { useAuth } from "../../backend/AuthContext";
import type { ThreadModel } from "../../backend/models/ThreadModel";


export const CreateThreadCardWide = ({onCancel, onCreate}: {onCancel: () => void, onCreate: (thread: ThreadModel) => void}) => {
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const auth = useAuth()
  const threadApiRef = threadApi(auth)

    const createThread = () => {
        if (title == '') {
            setError("Please enter a title!")
            return
        }
        if (content == '') {
            setError("Please enter some content!")
            return
        }
        threadApiRef.createThread(title, content).then(res => {
            if (res.thread) onCreate(res.thread)
            else setError(res.error!)
        })
    }

  return (
    <Card 
      className="flex overflow-hidden border border-gray-200"
    >
      <div className="flex flex-col items-center p-6 border-r gap-6 border-gray-200 bg-gray-50/50 min-w-[180px]">
        <Input
            type="text"
            placeholder="Enter title"
            id="new-thread-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
        />
        <Textarea
            placeholder="Enter post content"
            id="new-thread-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[200px]"
        />
        {
            error != "" &&
            <h3 className="text-l font-semibold mb-2 text-red-500">{error}</h3>

        }
        <div className="w-full flex flex-row align-center gap-2 justify-center">
            <Button type="button" className="w-100 !border-1" onClick={createThread}>Create</Button>
            <Button type="button" className="w-100 !border-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Card>
  );
};