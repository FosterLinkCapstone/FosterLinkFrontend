import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import { faqApi } from "../backend/api/FaqApi";
import type { AdminFaqForUserModel } from "../backend/models/AdminFaqForUserModel";
import type { FaqModel } from "../backend/models/FaqModel";
import { PageLayout } from "../components/PageLayout";
import { StatusDialog } from "../components/StatusDialog";
import { AdminFaqAnswerCard } from "../components/faq/AdminFaqAnswerCard";
import { FaqDialog } from "../components/faq/FaqDialog";
import { FaqCardSkeleton } from "../components/faq/FaqCardSkeleton";
import { OrderByCreatedAtSelect } from "../components/OrderByCreatedAtSelect";
import { Paginator } from "../components/Paginator";
import { sortByCreatedAt, type CreatedAtOrderBy } from "../util/SortUtil";
import { ArrowLeft } from "lucide-react";

export const AdminUserFaqAnswers = () => {
    const { userId } = useParams<{ userId: string }>();
    const auth = useAuth();
    const userApiRef = useRef(userApi(auth));
    const faqApiRef = useRef(faqApi(auth));
    userApiRef.current = userApi(auth);
    faqApiRef.current = faqApi(auth);

    const [items, setItems] = useState<AdminFaqForUserModel[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [orderBy, setOrderBy] = useState<CreatedAtOrderBy>("newest");

    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);
    const faqContent = useRef<string>("");
    const contentFaqId = useRef<number | null>(null);
    const [contentLoadingId, setContentLoadingId] = useState<number | null>(null);

    const displayedItems = useMemo(
        () => sortByCreatedAt(items, orderBy, (item) => item.faq.createdAt),
        [items, orderBy]
    );

    const fetchAnswers = useCallback(async (page: number) => {
        const id = userId ? parseInt(userId, 10) : NaN;
        if (!userId || isNaN(id)) {
            setError("Invalid user.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const res = await userApiRef.current.getFaqAnswersForUser(id, page);
        setLoading(false);
        if (!res.isError && res.data) {
            setItems(res.data.items);
            setTotalPages(res.data.totalPages);
            setCurrentPage(page + 1);
            if (res.data.items.length > 0 && res.data.items[0].faq?.author?.username) {
                setUsername(res.data.items[0].faq.author.username);
            }
        } else {
            setError(res.error ?? "Failed to load FAQ answers.");
            setItems([]);
        }
    }, [userId]);

    useEffect(() => {
        fetchAnswers(0);
    }, [fetchAnswers]);

    const handleExpand = (id: number) => setExpandedId(id);
    const handleCollapse = () => setExpandedId(null);

    const handleShowDetail = (faq: FaqModel) => {
        if (contentFaqId.current === faq.id) {
            setDetailFaq(faq);
            return;
        }
        setContentLoadingId(faq.id);
        faqApiRef.current.getContent(faq.id).then((res) => {
            if (!res.isError && res.data) {
                faqContent.current = res.data;
                contentFaqId.current = faq.id;
                setDetailFaq(faq);
            }
        }).finally(() => setContentLoadingId(null));
    };

    const handleCloseDetail = () => {
        setDetailFaq(null);
    };

    return (
        <PageLayout auth={auth}>
            <title>FAQ answers – User</title>

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
                    FAQ answers
                    {username != null && (
                        <span className="font-normal text-muted-foreground"> for @{username}</span>
                    )}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                    All FAQ answers by this user (approved, pending, denied, and hidden).
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <OrderByCreatedAtSelect value={orderBy} onValueChange={setOrderBy} className="shrink-0" />
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <FaqCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {!loading && items.length === 0 && !error && (
                    <div className="text-center text-muted-foreground py-12 rounded-xl border border-dashed border-border bg-muted/20">
                        No FAQ answers from this user.
                    </div>
                )}

                {!loading && displayedItems.length > 0 && (
                    <div className="space-y-4">
                        {displayedItems.map((item) => (
                            <AdminFaqAnswerCard
                                key={item.faq.id}
                                item={item}
                                onExpand={() => handleExpand(item.faq.id)}
                                onCollapse={handleCollapse}
                                onShowDetail={() => handleShowDetail(item.faq)}
                                expanded={expandedId === item.faq.id}
                                contentLoading={contentLoadingId === item.faq.id}
                            />
                        ))}
                        <Paginator<AdminFaqForUserModel[]>
                            pageCount={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            onDataChanged={setItems}
                            onPageChanged={async (pageNum) => {
                                const id = userId ? parseInt(userId, 10) : NaN;
                                if (isNaN(id)) return [];
                                const res = await userApiRef.current.getFaqAnswersForUser(id, pageNum - 1);
                                if (res.data) {
                                    setTotalPages(res.data.totalPages);
                                    return res.data.items;
                                }
                                return [];
                            }}
                        />
                    </div>
                )}
            </div>

            <FaqDialog
                detailFaq={detailFaq}
                content={faqContent.current}
                handleOpenChange={handleCloseDetail}
            />
        </PageLayout>
    );
};
