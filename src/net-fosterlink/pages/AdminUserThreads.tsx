import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import type { AdminThreadForUserModel } from "../backend/models/AdminThreadForUserModel";
import { PageLayout } from "../components/PageLayout";
import { StatusDialog } from "../components/StatusDialog";
import { AdminThreadCard } from "../components/forum/AdminThreadCard";
import { OrderByCreatedAtSelect } from "../components/OrderByCreatedAtSelect";
import { sortByCreatedAt, type CreatedAtOrderBy } from "../util/SortUtil";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const AdminUserThreads = () => {
    const { userId } = useParams<{ userId: string }>();
    const auth = useAuth();
    const userApiRef = useRef(userApi(auth));
    userApiRef.current = userApi(auth);

    const [items, setItems] = useState<AdminThreadForUserModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState<CreatedAtOrderBy>("newest");

    const displayedItems = useMemo(
        () => sortByCreatedAt(items, orderBy, (item) => item.createdAt),
        [items, orderBy]
    );

    const fetchThreads = useCallback(async () => {
        const id = userId ? parseInt(userId, 10) : NaN;
        if (!userId || isNaN(id)) {
            setError("Invalid user.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const res = await userApiRef.current.getThreadsForUser(id);
        setLoading(false);
        if (!res.isError && res.data) {
            setItems(res.data);
            if (res.data.length > 0 && res.data[0].author?.username) {
                setUsername(res.data[0].author.username);
            }
        } else {
            setError(res.error ?? "Failed to load threads.");
            setItems([]);
        }
    }, [userId]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    return (
        <PageLayout auth={auth}>
            <title>Threads – User</title>

            <StatusDialog
                open={!!error}
                onOpenChange={() => setError(null)}
                title={error ?? ""}
                subtext=""
                isSuccess={false}
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to User Management
                </Link>

                <h1 className="text-2xl font-bold mb-1">
                    Threads
                    {username != null && (
                        <span className="font-normal text-muted-foreground"> by @{username}</span>
                    )}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                    All threads by this user (including hidden and deleted). Click a thread to view it.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <OrderByCreatedAtSelect value={orderBy} onValueChange={setOrderBy} className="shrink-0" />
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-6 h-36 animate-pulse bg-muted/30 rounded-xl" />
                        ))}
                    </div>
                )}

                {!loading && items.length === 0 && !error && (
                    <div className="text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border bg-muted/20">
                        No threads from this user.
                    </div>
                )}

                {!loading && displayedItems.length > 0 && (
                    <div className="space-y-4">
                        {displayedItems.map((item) => (
                            <AdminThreadCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
