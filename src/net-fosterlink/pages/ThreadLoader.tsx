import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { ThreadDetailPage } from "./ThreadDetails";
import { useParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import { NotFound } from "./NotFound";

export const ThreadLoader = ({preloadedThread = undefined} : {preloadedThread: ThreadModel | undefined}) => {
    const {threadId} = useParams()
    const [thread, setThread] = useState<ThreadModel | undefined>(preloadedThread)
    const [is404, setIs404] = useState<boolean>(false)
    const auth = useAuth()
    const threadApiRef = threadApi(auth)

    useEffect(() => {
        if (!thread || thread.id !== +`${threadId}`) {
                threadApiRef.searchById(+`${threadId}`).then(res => {
                    if (!res.isError && res.data) {
                        setThread(res.data)
                    } else {
                        setIs404(true)
                    }
                })
        }
    }, [threadId])

    if (!thread) {
        if (is404) {
            return <NotFound/>
        }
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div>
        );
    } else {
        return <ThreadDetailPage thread={thread}/>
    }

};