import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router";
import type { AdminReplyForUserModel } from "@/net-fosterlink/backend/models/AdminReplyForUserModel";
import { BaseReplyContent } from "./BaseReplyContent";
import { formatDate } from "@/net-fosterlink/util/DateUtil";
import { MessageCircle } from "lucide-react";

interface AdminReplyCardProps {
    reply: AdminReplyForUserModel;
}

function statusLabel(reply: AdminReplyForUserModel): string {
    const pm = reply.postMetadata;
    if (pm.hidden && pm.userDeleted) return "Deleted by author";
    if (pm.hidden) return pm.hiddenBy ? `Hidden by ${pm.hiddenBy}` : "Hidden";
    if (pm.userDeleted) return "Deleted by author";
    return "Visible";
}

function statusClass(reply: AdminReplyForUserModel): string {
    const pm = reply.postMetadata;
    if (pm.hidden || pm.userDeleted)
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700";
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700";
}

export const AdminReplyCard = memo<AdminReplyCardProps>(({ reply }) => {
    const threadUrl = `/threads/thread/${reply.threadId}`;
    const authorLabel = reply.threadAuthorUsername ? `@${reply.threadAuthorUsername}` : "thread";

    const statusBanner = (
        <div className="mb-1 w-full">
            <Badge variant="outline" className={`block w-full text-center text-xs font-medium py-1.5 ${statusClass(reply)}`}>
                {statusLabel(reply)}
            </Badge>
        </div>
    );

    const replyingToBadge = (
        <div className="mb-2 w-full">
            <Badge variant="outline" className="w-full justify-center py-1.5 text-xs font-medium bg-muted/50 hover:bg-muted border-border cursor-pointer" asChild>
                <Link to={threadUrl} className="inline-flex items-center gap-1.5 no-underline text-foreground hover:text-primary">
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Replying to {authorLabel} - Click to view</span>
                </Link>
            </Badge>
        </div>
    );

    const content = (
        <>
            <p className="text-foreground mb-3 text-start whitespace-pre-wrap">{reply.content}</p>
            <span className="text-xs text-muted-foreground">
                Posted at {formatDate(new Date(reply.createdAt))}
            </span>
        </>
    );

    return (
        <div className="flex flex-col w-full gap-1">
            {statusBanner}
            <Card className="p-4 mb-4 border-border">
                {replyingToBadge}
                <BaseReplyContent author={reply.author} content={content} />
            </Card>
        </div>
    );
});
