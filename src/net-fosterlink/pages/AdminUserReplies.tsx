import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import type { AdminReplyForUserModel } from "../backend/models/AdminReplyForUserModel";
import { PageLayout } from "../components/PageLayout";
import { StatusDialog } from "../components/StatusDialog";
import { AdminReplyCard } from "../components/forum/AdminReplyCard";
import { OrderByCreatedAtSelect } from "../components/OrderByCreatedAtSelect";
import { sortByCreatedAt, type CreatedAtOrderBy } from "../util/SortUtil";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const AdminUserReplies = () => {
    const { userId } = useParams<{ userId: string }>();
    const auth = useAuth();
    const userApiRef = useRef(userApi(auth));
    userApiRef.current = userApi(auth);

    const [items, setItems] = useState<AdminReplyForUserModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState<CreatedAtOrderBy>("newest");

    const displayedItems = useMemo(
        () => sortByCreatedAt(items, orderBy, (item) => item.createdAt),
        [items, orderBy]
    );

    const fetchReplies = useCallback(async () => {
        const id = userId ? parseInt(userId, 10) : NaN;
        if (!userId || isNaN(id)) {
            setError("Invalid user.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const res = await userApiRef.current.getRepliesForUser(id);
        setLoading(false);
        if (!res.isError && res.data) {
            setItems(res.data);
            if (res.data.length > 0 && res.data[0].author?.username) {
                setUsername(res.data[0].author.username);
            }
        } else {
            setError(res.error ?? "Failed to load replies.");
            setItems([]);
        }
    }, [userId]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    return (
        <PageLayout auth={auth}>
            <title>Replies – User</title>

            <StatusDialog
                open={!!error}
                onOpenChange={() => setError(null)}
                title={error ?? ""}
                subtext=""
                isSuccess={false}
            />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to User Management
                </Link>

                <h1 className="text-2xl font-bold mb-1">
                    Replies
                    {username != null && (
                        <span className="font-normal text-muted-foreground"> by @{username}</span>
                    )}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                    All replies by this user (including hidden and deleted).
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <OrderByCreatedAtSelect value={orderBy} onValueChange={setOrderBy} className="shrink-0" />
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="p-6 h-32 animate-pulse bg-muted/30 rounded-xl" />
                        ))}
                    </div>
                )}

                {!loading && items.length === 0 && !error && (
                    <div className="text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border bg-muted/20">
                        No replies from this user.
                    </div>
                )}

                {!loading && displayedItems.length > 0 && (
                    <div className="space-y-4">
                        {displayedItems.map((reply) => (
                            <AdminReplyCard key={reply.id} reply={reply} />
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
