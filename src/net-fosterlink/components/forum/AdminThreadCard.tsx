import { Badge } from "@/components/ui/badge";
import type { AdminThreadForUserModel } from "@/net-fosterlink/backend/models/AdminThreadForUserModel";
import type { ThreadModel } from "@/net-fosterlink/backend/models/ThreadModel";
import { ThreadPreviewWide } from "./ThreadPreviewWide";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";

interface AdminThreadCardProps {
    item: AdminThreadForUserModel;
}

function statusLabel(item: AdminThreadForUserModel): string {
    if (item.hidden && item.userDeleted) return "Deleted by author";
    if (item.hidden) return item.hiddenBy ? `Hidden by ${item.hiddenBy}` : "Hidden";
    if (item.userDeleted) return "Deleted by author";
    return "Visible";
}

function statusClass(item: AdminThreadForUserModel): string {
    if (item.hidden || item.userDeleted)
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700";
    return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700";
}

/** Map admin thread to ThreadModel shape for ThreadPreviewWide (counts/tags are placeholders). */
function toThreadPreview(item: AdminThreadForUserModel): ThreadModel {
    return {
        id: item.id,
        title: item.title,
        content: item.content,
        createdAt: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
        updatedAt: item.updatedAt ? (typeof item.updatedAt === "string" ? new Date(item.updatedAt) : item.updatedAt) : (typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt),
        author: item.author,
        likeCount: 0,
        liked: false,
        commentCount: 0,
        userPostCount: 0,
        tags: [],
    };
}

export const AdminThreadCard: React.FC<AdminThreadCardProps> = ({ item }) => {
    const auth = useAuth();
    const thread = toThreadPreview(item);
    const basePath = item.hidden ? "/threads/hidden/thread/" : "/threads/thread/";

    const statusBanner = (
        <div className="mb-1 w-full">
            <Badge variant="outline" className={`block w-full text-center text-xs font-medium py-1.5 ${statusClass(item)}`}>
                {statusLabel(item)}
            </Badge>
        </div>
    );

    return (
        <div className="flex flex-col w-full gap-1">
            {statusBanner}
            <ThreadPreviewWide thread={thread} auth={auth} basePath={basePath} />
        </div>
    );
};
