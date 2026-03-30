import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownContent, decodeHtmlEntities } from "@/components/ui/markdown-content";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";
import { useAuth } from "../../backend/AuthContext";
import { memo, useCallback, useRef, useState } from "react";
import { threadApi } from "../../backend/api/ThreadApi";
import { confirm } from "../ConfirmDialog";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { HiddenReplyCard } from "./HiddenReplyCard";
import { BaseReplyContent } from "./BaseReplyContent";
import { formatDate } from "@/net-fosterlink/util/DateUtil";
import { useLikeToggle } from "@/net-fosterlink/hooks/useLikeToggle";

interface ReplyCardProps {
    reply: ReplyModel;
    onReply: (username: string) => void;
    onReplyUpdate?: (updatedReply: ReplyModel) => void;
    onReplyDelete?: (replyId: number) => void;
    onReplyRestore?: (replyId: number) => void;
    onReplyHide?: (replyId: number, hiddenBy: string) => void;
}

export const ReplyCard = memo<ReplyCardProps>(({ reply, onReply, onReplyUpdate, onReplyDelete, onReplyRestore, onReplyHide }) => {
    const auth = useAuth()
    const threadApiRef = useRef(threadApi(auth))
    threadApiRef.current = threadApi(auth)

    const apiCall = useCallback(() => threadApiRef.current.likeReply(reply.id), [reply.id]);
    const { isLiked, likeCount, likeInFlight, toggleLike } = useLikeToggle(reply.liked, reply.likeCount, apiCall);
    const [editing, setEditing] = useState<boolean>(false)
    const [editedContent, setEditedContent] = useState<string>(decodeHtmlEntities(reply.content))
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState<boolean>(false)

    const isReplyAuthor = auth.isLoggedIn() && auth.getUserInfo()?.id === reply.author.id;

    const likeReply = useCallback(() => {
        if (!auth.isLoggedIn()) return;
        toggleLike();
    }, [auth, toggleLike])

    const handleEditedContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value)
    }, [])

    const submitEdit = useCallback(() => {
        setFieldErrors({})
        setLoading(true)
        threadApiRef.current.editReplyContent(reply.id, editedContent).then(res => {
            setLoading(false)
            if (!res.isError && res.data) {
                reply.content = editedContent
                setEditing(false)
                if (onReplyUpdate) onReplyUpdate(res.data)
            } else if (res.validationErrors) {
                const next: { [key: string]: string } = {}
                res.validationErrors.forEach(e => { next[e.field] = e.message })
                setFieldErrors(next)
            }
        })
    }, [reply.id, editedContent, onReplyUpdate])

    const deleteReply = useCallback(async () => {
        setLoading(true)
        const res = await confirm({ message: 'Are you sure you want to delete this reply?' })
        if (res) {
            threadApiRef.current.deleteReply(reply.id).then(result => {
                setLoading(false)
                if (!result.isError && result.data && onReplyDelete) {
                    onReplyDelete(reply.id)
                }
            })
        } else {
            setLoading(false)
        }
    }, [reply.id, onReplyDelete])

    const hideReply = useCallback(async () => {
        setLoading(true)
        const res = await confirm({
            message: 'Are you sure you want to hide this reply? It will only be visible to administrators.',
        })
        if (res) {
            threadApiRef.current.hideReply(reply.id, true).then(result => {
                setLoading(false)
                if (!result.isError && onReplyHide) {
                    onReplyHide(reply.id, auth.getUserInfo()!.username)
                }
            })
        } else {
            setLoading(false)
        }
    }, [reply.id, auth, onReplyHide])

    const deleteReplyAsUser = useCallback(async () => {
        const res = await confirm({
            message: 'Are you sure you want to delete this reply?',
        })
        if (!res) return
        setLoading(true)
        threadApiRef.current.deleteReply(reply.id, true).then((result) => {
            if (!result.isError && onReplyDelete) {
                onReplyDelete(reply.id)
            }
        }).finally(() => setLoading(false))
    }, [reply.id, onReplyDelete])

    const handleReply = useCallback(() => onReply(reply.author.username), [onReply, reply.author.username])

    const handleToggleEdit = useCallback(() => {
        if (editing) {
            setEditedContent(decodeHtmlEntities(reply.content))
            setEditing(false)
        } else {
            setEditing(true)
        }
    }, [editing, reply.content])

    if (reply.postMetadata?.hidden && (auth.admin || isReplyAuthor)) {
        return (
            <HiddenReplyCard
                reply={reply}
                onReplyDelete={onReplyDelete}
                onReplyRestore={onReplyRestore}
            />
        )
    }

    const replyContent = (
        <>
            {editing ? (
                <div className="grid gap-2 mb-3">
                    <MarkdownTextarea
                        value={editedContent}
                        onChange={handleEditedContentChange}
                        className="w-full min-h-[100px]"
                    />
                    <span className="text-red-500">{fieldErrors["content"]}</span>
                </div>
            ) : (
                <MarkdownContent content={reply.content} className="text-foreground mb-3 text-start" />
            )}

            <div className="flex flex-wrap items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Posted at {formatDate(new Date(reply.createdAt))}
                </span>
                <div className="flex items-center gap-3">
                    <button
                        className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75"
                        disabled={!auth.isLoggedIn() || likeInFlight || auth.restricted}
                        onClick={likeReply}
                    >
                        {isLiked ? (
                            <>
                                <Heart fill="currentColor" className="h-4 w-4 text-destructive" />
                                <span className="text-sm text-destructive">{likeCount}</span>
                            </>
                        ) : (
                            <>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{likeCount}</span>
                            </>
                        )}
                    </button>
                    {auth.isLoggedIn() && (
                        <Button variant="ghost" size="sm" onClick={handleReply} disabled={auth.restricted}>
                            Reply
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-row gap-2 flex-wrap">
                {auth.isLoggedIn() && auth.admin && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700/70 dark:hover:bg-amber-900/70" onClick={hideReply} disabled={auth.restricted}>
                            Hide
                        </Button>
                        {isReplyAuthor && (
                            <Button variant="outline" size="sm" className="bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70" onClick={deleteReplyAsUser} disabled={auth.restricted}>
                                Delete
                            </Button>
                        )}
                    </div>
                )}
                {auth.isLoggedIn() && !auth.admin && auth.getUserInfo()?.id === reply.author.id && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70" onClick={deleteReply} disabled={auth.restricted}>
                            Delete
                        </Button>
                    </div>
                )}
                {auth.isLoggedIn() && auth.getUserInfo()?.id === reply.author.id && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleEdit}
                            disabled={auth.restricted}
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                        {editing && (
                            <Button variant="outline" size="sm" onClick={submitEdit} disabled={auth.restricted || loading}>
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        )}
                    </div>
                )}
                <BackgroundLoadSpinner loading={loading} />
            </div>
        </>
    );

    return (
        <Card className="p-4 mb-4 border-border">
            <BaseReplyContent
                author={reply.author}
                content={replyContent}
            />
        </Card>
    );
});
