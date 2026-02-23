import { Loader2 } from "lucide-react";
import { useParams } from "react-router";
import type { HiddenThreadModel } from "../backend/models/HiddenThreadModel";
import { HiddenThreadDetailPage } from "./HiddenThreadDetail";
import { NotFound } from "./NotFound";
import { useEffect, useState } from "react";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";

export const HiddenThreadLoader = ({preloadedThread = undefined} : {preloadedThread?: HiddenThreadModel | undefined}) => {
    const [thread, setThread] = useState<HiddenThreadModel | undefined>(preloadedThread)
    const [is404, setIs404] = useState<boolean>(false)
    const {threadId} = useParams()
    const auth = useAuth()
    const threadApiRef = threadApi(auth)

    useEffect(() => {
        if (!preloadedThread && threadId != null) {
            setIs404(false)
            setThread(undefined)
            threadApiRef.getHiddenThread(+threadId).then(res => {
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
            return <NotFound />;
        }
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return <HiddenThreadDetailPage thread={thread} />;
};
