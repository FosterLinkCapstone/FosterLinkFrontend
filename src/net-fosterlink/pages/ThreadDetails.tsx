import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { ReplyCard } from "../components/forum/ReplyCard";
import { ThreadPreviewMicro } from "../components/forum/ThreadPreviewMicro";
import { useEffect, useState } from "react";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { PageLayout } from "../components/PageLayout";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import type { ReplyModel } from "../backend/models/ReplyModel";
import { getInitials } from "../util/StringUtil";
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner";
import { confirm } from "../components/ConfirmDialog";
import { VerifiedCheck } from "../components/badges/VerifiedCheck";
import { useLikeToggle } from "../hooks/useLikeToggle";
import { ThreadReplySidebar } from "../components/forum/ThreadReplySidebar";
import { ThreadHeader } from "../components/forum/ThreadHeader";
import { ThreadContentCard } from "../components/forum/ThreadContentCard";
import { ThreadActionsBar } from "../components/forum/ThreadActionsBar";

export const ThreadDetailPage = ({ thread }: { thread: ThreadModel }) => {
    const [replyText, setReplyText] = useState('');
    const [replyFieldErrors, setReplyFieldErrors] = useState<{ [key: string]: string }>({});
    const [replyError, setReplyError] = useState<string>('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [editing, setEditing] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(thread.content);
    const [otherThreads, setOtherThreads] = useState<ThreadModel[]>([])
    const [threadEditLoading, setThreadEditLoading] = useState<boolean>(false)
    const [tagEditLoading, setTagEditLoading] = useState<boolean>(false)
    const [replies, setReplies] = useState<ReplyModel[]>([])
    const [loadingReplies, setLoadingReplies] = useState<boolean>(true)
    const [editingTags, setEditingTags] = useState<boolean>(false);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [titleEditLoading, setTitleEditLoading] = useState<boolean>(false)
    const auth = useAuth()
    const threadApiRef = threadApi(auth)
    const { isLiked, likeCount, likeInFlight, toggleLike } = useLikeToggle(
        thread.liked,
        thread.likeCount,
        () => threadApiRef.likeThread(thread.id)
    )

    useEffect(() => {
        document.title = `${thread.author.username} · ${thread.title}`
        return () => { document.title = 'FosterLink' }
    }, [thread.author.username, thread.title])

    useEffect(() => {
        setLoadingReplies(true)
        threadApiRef.getReplies(thread.id).then(res => {
            if (!res.isError && res.data) {
                setReplies(res.data)
                setLoadingReplies(false)
            }
        })
        threadApiRef.randForUser(thread.author.id).then(res => {
            if (!res.isError && res.data) {
                setOtherThreads(res.data)
            }
        })
    }, [thread.id])

    const handleReply = (username: string) => {
        setReplyingTo(username);
        setReplyText(`@${username}, `);
    };

    const handleSubmitNewReply = () => {
        if (auth.isLoggedIn()) {
            setReplyError('');
            setReplyFieldErrors({});
            if (replyText != '' && thread) {
                threadApiRef.replyTo(replyText, thread.id).then(res => {
                    if (!res.isError && res.data) {
                        setReplies([res.data, ...replies])
                        setReplyText('');
                        setReplyingTo(null);
                    } else {
                        setReplyError(res.error || "Internal server error... please try again later!");
                        if (res.validationErrors) {
                            const next: { [key: string]: string } = {};
                            res.validationErrors.forEach(e => { next[e.field] = e.message; });
                            setReplyFieldErrors(next);
                        }
                    }
                })
            } else {
                setReplyError("Please enter something!");
            }
        } else {
            setReplyError("Please log in");
        }
    };

    const likeThread = () => {
        if (!auth.isLoggedIn()) return;
        toggleLike();
    }

    const submitEdit = () => {
        thread.content = editedContent
        setEditing(false)
        setThreadEditLoading(true)
        threadApiRef.editThreadContent(thread.id, editedContent).then(() => {
            setThreadEditLoading(false)
        })
    }

    const tagsUpdated = (editedTags: string[]) => {
        thread.tags = editedTags;
        setTagEditLoading(true);
        threadApiRef.updateTags(thread.id, editedTags).then(() => {
            setTagEditLoading(false);
        })
    }
    const titleUpdated = (editedTitle: string) => {
        thread.title = editedTitle;
        setTitleEditLoading(true);
        threadApiRef.updateTitle(thread.id, editedTitle).then(() => {
            setTitleEditLoading(false);
        })
    }

    const hideThread = async () => {
        setThreadEditLoading(true)
        const res = await confirm({ message: 'Are you sure you want to delete this thread?' })
        if (res) {
            threadApiRef.setThreadHidden(thread.id, true).then(() => {
                window.location.href = `/threads`
            }).finally(() => setThreadEditLoading(false))
        } else {
            setThreadEditLoading(false)
        }
    }

    const handleCancelReply = () => {
        setReplyText('');
        setReplyingTo(null);
    };

    const handleReplyUpdate = (updatedReply: ReplyModel) => {
        setReplies(replies.map(r => r.id === updatedReply.id ? updatedReply : r))
    };

    const handleReplyDelete = (replyId: number) => {
        setReplies(replies.filter(r => r.id !== replyId))
    };

    const handleReplyRestore = (replyId: number) => {
        setReplies(replies.map(r => r.id === replyId ? { ...r, postMetadata: undefined } : r))
    };

    const handleReplyHide = (replyId: number, hiddenBy: string) => {
        setReplies(replies.map(r => r.id === replyId
            ? { ...r, postMetadata: { id: r.postMetadata?.id ?? 0, hidden: true, userDeleted: false, locked: false, verified: false, hiddenBy } }
            : r
        ))
    };

    const currentUserId = auth.isLoggedIn() ? auth.getUserInfo()!.id : null;
    const isAuthor = currentUserId === thread.author.id;

    return (
        <PageLayout auth={auth}>
            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                <div className="w-80 space-y-4">
                    <ThreadReplySidebar
                        replyText={replyText}
                        replyFieldErrors={replyFieldErrors}
                        replyError={replyError}
                        isLoggedIn={auth.isLoggedIn()}
                        restricted={auth.restricted}
                        onReplyTextChange={setReplyText}
                        onSubmit={handleSubmitNewReply}
                    />

                    <Card className="p-4 border-border">
                        <h3 className="font-semibold mb-3">Other Threads From This User</h3>
                        <div className="max-h-[400px] overflow-y-auto">
                            {otherThreads.map(t =>
                                <ThreadPreviewMicro key={t.id} thread={t} />
                            )}
                        </div>
                    </Card>
                </div>

                <div className="flex-1">
                    <ThreadHeader 
                        thread={thread} 
                        tagsUpdated={tagsUpdated} 
                        editingTags={editingTags} 
                        setEditingTags={setEditingTags} 
                        tagEditLoading={tagEditLoading}
                        titleUpdated={titleUpdated}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        titleEditLoading={titleEditLoading}
                    />

                    <ThreadContentCard
                        content={thread.content}
                        editing={editing}
                        editedContent={editedContent}
                        onEditedContentChange={setEditedContent}
                        onSubmitEdit={submitEdit}
                    />

                    {auth.isLoggedIn() && (
                        <ThreadActionsBar
                            isAdmin={!!auth.admin}
                            isAuthor={isAuthor}
                            editing={editing}
                            loading={threadEditLoading}
                            restricted={auth.restricted}
                            onHideOrDelete={hideThread}
                            onToggleEdit={() => setEditing(!editing)}
                            onSubmitEdit={submitEdit}
                        />
                    )}

                    <button
                        className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75"
                        disabled={!auth.isLoggedIn() || likeInFlight || auth.restricted}
                        onClick={likeThread}
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

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Replies</h2>
                        {loadingReplies ? (
                            <BackgroundLoadSpinner className="self-center justify-self-center" loading={loadingReplies} />
                        ) : (
                            replies.length === 0
                                ? <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
                                : replies.map(r =>
                                    <ReplyCard
                                        key={r.id}
                                        reply={r}
                                        onReply={handleReply}
                                        onReplyUpdate={handleReplyUpdate}
                                        onReplyDelete={handleReplyDelete}
                                        onReplyRestore={handleReplyRestore}
                                        onReplyHide={handleReplyHide}
                                    />
                                )
                        )}

                        {(replyingTo && auth.isLoggedIn()) && (
                            <Card className="p-4 mb-4 border-2 border-primary/30">
                                <div className="flex gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={auth.getUserInfo()!.profilePictureUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(auth.getUserInfo()!.fullName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold">{auth.getUserInfo()!.username}</span>
                                            {auth.getUserInfo()!.verified && <VerifiedCheck className="h-4 w-4" />}
                                            <span className="text-sm text-muted-foreground">
                                                Member since {new Date(auth.getUserInfo()!.createdAt).getFullYear()}
                                            </span>
                                        </div>

                                        <div className="grid gap-2 mb-3">
                                            <Textarea
                                                placeholder="Enter text here"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                            <span className="text-red-500">{replyFieldErrors["content"]}</span>
                                        </div>
                                        {replyError && <p className="text-red-500 text-sm mb-2">{replyError}</p>}
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={handleCancelReply}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSubmitNewReply} disabled={auth.restricted}>
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};
