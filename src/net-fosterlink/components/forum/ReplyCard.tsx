import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../../backend/AuthContext";
import { useCallback, useState } from "react";
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

export const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onReply, onReplyUpdate, onReplyDelete, onReplyRestore, onReplyHide }) => {
    const auth = useAuth()
    const threadApiRef = threadApi(auth)
    const apiCall = useCallback(() => threadApiRef.likeReply(reply.id), [reply.id]);
    const { isLiked, likeCount, likeInFlight, toggleLike } = useLikeToggle(reply.liked, reply.likeCount, apiCall);
    const [editing, setEditing] = useState<boolean>(false)
    const [editedContent, setEditedContent] = useState<string>(reply.content)
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState<boolean>(false)

    const isReplyAuthor = auth.isLoggedIn() && auth.getUserInfo()!.id === reply.author.id;
    if (reply.postMetadata?.hidden && (auth.admin || isReplyAuthor)) {
        return (
            <HiddenReplyCard
                reply={reply}
                onReplyDelete={onReplyDelete}
                onReplyRestore={onReplyRestore}
            />
        )
    }

    const likeReply = () => {
        if (!auth.isLoggedIn()) return;
        toggleLike();
    }

    const submitEdit = () => {
        setFieldErrors({})
        setLoading(true)
        threadApiRef.editReplyContent(reply.id, editedContent).then(res => {
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
    }

    const deleteReply = async () => {
        setLoading(true)
        const res = await confirm({ message: 'Are you sure you want to delete this reply?' })
        if (res) {
            threadApiRef.deleteReply(reply.id).then(result => {
                setLoading(false)
                if (!result.isError && result.data && onReplyDelete) {
                    onReplyDelete(reply.id)
                }
            })
        } else {
            setLoading(false)
        }
    }

    const hideReply = async () => {
        setLoading(true)
        const res = await confirm({
            message: 'Are you sure you want to hide this reply? It will only be visible to administrators.',
        })
        if (res) {
            threadApiRef.hideReply(reply.id, true).then(result => {
                setLoading(false)
                if (!result.isError && onReplyHide) {
                    onReplyHide(reply.id, auth.getUserInfo()!.username)
                }
            })
        } else {
            setLoading(false)
        }
    }

    const replyContent = (
        <>
            {editing ? (
                <div className="grid gap-2 mb-3">
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full min-h-[100px]"
                    />
                    <span className="text-red-500">{fieldErrors["content"]}</span>
                </div>
            ) : (
                <p className="text-foreground mb-3 text-start whitespace-pre-wrap">{reply.content}</p>
            )}

            <div className="flex items-center justify-between">
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
                        <Button variant="ghost" size="sm" onClick={() => onReply(reply.author.username)} disabled={auth.restricted}>
                            Reply
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-row gap-2 flex-wrap">
                {auth.isLoggedIn() && auth.admin && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70" onClick={hideReply} disabled={auth.restricted}>
                            Hide
                        </Button>
                    </div>
                )}
                {auth.isLoggedIn() && !auth.admin && auth.getUserInfo()!.id === reply.author.id && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70" onClick={deleteReply} disabled={auth.restricted}>
                            Delete
                        </Button>
                    </div>
                )}
                {auth.isLoggedIn() && auth.getUserInfo()!.id === reply.author.id && (
                    <div className="mt-2 flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (editing) {
                                    setEditedContent(reply.content)
                                    setEditing(false)
                                } else {
                                    setEditing(true)
                                }
                            }}
                            disabled={auth.restricted}
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                        {editing && (
                            <Button variant="outline" size="sm" onClick={submitEdit} disabled={auth.restricted}>
                                Submit
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
};
