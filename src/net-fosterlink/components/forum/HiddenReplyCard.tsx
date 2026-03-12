import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../backend/AuthContext";
import { useState } from "react";
import { threadApi } from "../../backend/api/ThreadApi";
import { confirm } from "../ConfirmDialog";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { BaseReplyContent } from "./BaseReplyContent";
import { formatDate } from "@/net-fosterlink/util/DateUtil";

interface HiddenReplyCardProps {
    reply: ReplyModel;
    onReplyDelete?: (replyId: number) => void;
    onReplyRestore?: (replyId: number) => void;
}

export const HiddenReplyCard: React.FC<HiddenReplyCardProps> = ({ reply, onReplyDelete, onReplyRestore }) => {
    const auth = useAuth()
    const threadApiRef = threadApi(auth)
    const [loading, setLoading] = useState<boolean>(false)
    const [expanded, setExpanded] = useState<boolean>(false)

    const hiddenByLabel = reply.postMetadata?.userDeleted
        ? 'Deleted by its author'
        : reply.postMetadata?.hiddenBy
            ? `Hidden by ${reply.postMetadata.hiddenBy}`
            : 'Hidden by an administrator'

    const restoreReply = async () => {
        const confirmed = await confirm({
            message: 'Are you sure you want to restore this reply? It will become visible to all users.',
        })
        if (confirmed) {
            setLoading(true)
            threadApiRef.hideReply(reply.id, false).then(result => {
                setLoading(false)
                if (!result.isError && onReplyRestore) {
                    onReplyRestore(reply.id)
                }
            })
        }
    }

    const permanentlyDeleteReply = async () => {
        const confirmed = await confirm({
            message: 'Are you sure you want to permanently delete this reply? This action cannot be undone.',
        })
        if (confirmed) {
            setLoading(true)
            threadApiRef.deleteHiddenReply(reply.id).then(result => {
                setLoading(false)
                if (!result.isError && onReplyDelete) {
                    onReplyDelete(reply.id)
                }
            })
        }
    }

    const replyContent = (
        <>
            <p className="text-foreground mb-3 text-start whitespace-pre-wrap">{reply.content}</p>
            <div className="flex flex-row gap-2 flex-wrap items-center">
                {((reply.postMetadata?.userDeleted && auth.isLoggedIn() && auth.getUserInfo()!.id === reply.author.id && !auth.admin) || (!reply.postMetadata?.userDeleted && auth.admin)) && (
                    <Button variant="outline" size="sm" onClick={restoreReply} disabled={auth.restricted}>
                        Restore
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70"
                    onClick={permanentlyDeleteReply}
                    disabled={auth.restricted}
                >
                    Permanently Delete
                </Button>
                <BackgroundLoadSpinner loading={loading} />
            </div>
        </>
    );

    return (
        <Card className="mb-4 border-destructive/30 bg-destructive/5 overflow-hidden">
            <button
                type="button"
                className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-destructive/10 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-destructive/70" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-destructive/70" />
                )}
                <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                <span className="text-sm text-destructive font-medium">{hiddenByLabel}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="text-sm text-muted-foreground font-semibold min-w-0 truncate">{reply.author.username}</span>
                <span className="text-muted-foreground mx-1">·</span>
                <span className="text-xs text-muted-foreground">{formatDate(new Date(reply.createdAt))}</span>
            </button>

            {expanded && (
                <div className="px-4 pb-4 border-t border-destructive/20 pt-4">
                    <BaseReplyContent
                        author={reply.author}
                        content={replyContent}
                    />
                </div>
            )}
        </Card>
    );
};
