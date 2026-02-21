import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ApprovalStatus, type PendingFaqModel } from "../backend/models/PendingFaqModel";
import type { HiddenFaqModel } from "../backend/models/HiddenFaqModel";
import type { FaqModel } from "../backend/models/FaqModel";
import { useAuth } from "../backend/AuthContext";
import { faqApi } from "../backend/api/FaqApi";
import { Navbar } from "../components/Navbar";
import { FaqDialog } from "../components/faq/FaqDialog";
import { PendingFaqCard } from "../components/faq/PendingFaqCard";
import { HiddenFaqCard } from "../components/faq/HiddenFaqCard";
import { StatusDialog } from "../components/StatusDialog";
import { FaqCardSkeleton } from "../components/faq/FaqCardSkeleton";
import { Paginator } from "../components/Paginator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { confirm } from "../components/ConfirmDialog";

const TAB_PENDING = "pending";
const TAB_HIDDEN_USER = "hidden-user";
const TAB_HIDDEN_ADMIN = "hidden-admin";
const TAB_PARAM = "tab";

type ActiveTab = typeof TAB_PENDING | typeof TAB_HIDDEN_USER | typeof TAB_HIDDEN_ADMIN;

const isValidTab = (t: string | null): t is ActiveTab =>
  t === TAB_PENDING || t === TAB_HIDDEN_USER || t === TAB_HIDDEN_ADMIN;

export const PendingFaqs = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedHiddenId, setExpandedHiddenId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);
  const faqContent = useRef<string>('');
  const [faqs, setFaqs] = useState<PendingFaqModel[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [approvedOrDenied, setApprovedOrDenied] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [hiddenFaqs, setHiddenFaqs] = useState<HiddenFaqModel[]>([]);
  const [hiddenTotalPages, setHiddenTotalPages] = useState<number>(0);
  const [hiddenCurrentPage, setHiddenCurrentPage] = useState<number>(1);
  const [hiddenLoading, setHiddenLoading] = useState<boolean>(false);
  const [hiddenError, setHiddenError] = useState<string | null>(null);
  const [hiddenChangeSuccess, setHiddenChangeSuccess] = useState<"restore" | "delete" | null>(null);

  const tabFromUrl = searchParams.get(TAB_PARAM) ?? TAB_PENDING;
  const activeTab: ActiveTab = isValidTab(tabFromUrl) ? tabFromUrl : TAB_PENDING;

  const auth = useAuth();
  const faqApiRef = useRef(faqApi(auth));
  faqApiRef.current = faqApi(auth);

  useEffect(() => {
    setLoading(true);
    faqApiRef.current.getPending(0).then(res => {
      if (!res.isError && res.data) {
        setFaqs(res.data.faqs);
        setTotalPages(res.data.totalPages);
        setCurrentPage(1);
        const opened = searchParams.get("openId");
        if (opened != null) {
          const faq = res.data.faqs.find(f => f.id == +opened);
          if (faq) handleShowDetail(faq);
        }
      }
    }).finally(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    if (activeTab === TAB_HIDDEN_USER || activeTab === TAB_HIDDEN_ADMIN) {
      const type = activeTab === TAB_HIDDEN_ADMIN ? "ADMIN" : "USER";
      setHiddenLoading(true);
      faqApiRef.current.getHiddenFaqs(type, 0).then(res => {
        if (!res.isError && res.data) {
          setHiddenFaqs(res.data.faqs);
          setHiddenTotalPages(res.data.totalPages);
          setHiddenCurrentPage(1);
          setHiddenError(null);
        } else {
          setHiddenFaqs([]);
          setHiddenTotalPages(0);
          setHiddenError(res.error ?? "Failed to fetch hidden FAQs");
        }
      }).finally(() => { setHiddenLoading(false); });
    }
  }, [activeTab]);

  const setTabInUrl = (tab: ActiveTab) => {
    const next = new URLSearchParams(searchParams);
    next.set(TAB_PARAM, tab);
    setSearchParams(next, { replace: true });
  };

  const handleExpand = (id: number) => { setExpandedId(id); };
  const handleCollapse = () => { setExpandedId(null); };

  const handleShowDetail = (faq: PendingFaqModel) => {
    const asFaqModel: FaqModel = {
      id: faq.id,
      title: faq.title,
      summary: faq.summary,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
      author: faq.author,
      approvedByUsername: faq.deniedByUsername ?? '',
    };
    faqApiRef.current.getContent(faq.id).then(res => {
      if (!res.isError && res.data) {
        faqContent.current = res.data;
        setDetailFaq(asFaqModel);
      }
    });
  };

  const handleShowDetailHidden = (faq: HiddenFaqModel) => {
    const asFaqModel: FaqModel = {
      id: faq.id,
      title: faq.title,
      summary: faq.summary,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
      author: faq.author,
      approvedByUsername: '',
    };
    faqApiRef.current.getContent(faq.id).then(res => {
      if (!res.isError && res.data) {
        faqContent.current = res.data;
        setDetailFaq(asFaqModel);
      }
    });
  };

  const handleCloseDetail = () => { setDetailFaq(null); };

  const handleApprove = async (faq: PendingFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to approve this FAQ response? It will become visible to all users.",
    });
    if (confirmed) {
      faqApiRef.current.approve(faq.id, true).then(res => {
        if (!res.isError && res.data) {
          setFaqs(faqs.filter(f => f.id !== faq.id));
          setApprovedOrDenied("approved");
        } else {
          alert(res.error || "Error approving!");
        }
      });
    }
  };

  const handleDeny = async (faq: PendingFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to deny this FAQ response? The author will be notified.",
    });
    if (confirmed) {
      faqApiRef.current.approve(faq.id, false).then(res => {
        if (!res.isError && res.data) {
          faq.approvalStatus = ApprovalStatus.DENIED;
          faq.deniedByUsername = auth.getUserInfo()!.username;
          setApprovedOrDenied("denied");
        } else {
          alert(res.error || "Error denying!");
        }
      });
    }
  };

  const handleDeletePending = async (faq: PendingFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to permanently delete this FAQ? It will not be recoverable.",
    });
    if (confirmed) {
      faqApiRef.current.deleteFaq(faq.id).then(res => {
        if (!res.isError) {
          setFaqs(prev => prev.filter(f => f.id !== faq.id));
          setApprovedOrDenied("deleted");
        } else {
          alert(res.error || "Failed to delete FAQ");
        }
      });
    }
  };

  const handleRestore = async (faq: HiddenFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to restore this FAQ? It will become visible to all users.",
    });
    if (confirmed) {
      faqApiRef.current.setFaqHidden(faq.id, false).then(res => {
        if (!res.isError) {
          setHiddenFaqs(prev => prev.filter(f => f.id !== faq.id));
          setHiddenChangeSuccess("restore");
        } else {
          setHiddenError(res.error ?? "Failed to restore FAQ");
        }
      });
    }
  };

  const handleDeleteHidden = async (faq: HiddenFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to permanently delete this FAQ? It will not be recoverable.",
    });
    if (confirmed) {
      faqApiRef.current.deleteHiddenFaq(faq.id).then(res => {
        if (!res.isError) {
          setHiddenFaqs(prev => prev.filter(f => f.id !== faq.id));
          setHiddenChangeSuccess("delete");
        } else {
          setHiddenError(res.error ?? "Failed to delete FAQ");
        }
      });
    }
  };

  const hiddenType = activeTab === TAB_HIDDEN_ADMIN ? "ADMIN" : "USER";

  return (
    <div className="min-h-screen bg-background">
      <StatusDialog open={approvedOrDenied != ''}
        onOpenChange={() => setApprovedOrDenied('')}
        title={`Successfully ${approvedOrDenied} FAQ response`}
        subtext=""
        isSuccess={true}
      />
      <StatusDialog
        open={hiddenChangeSuccess != null}
        onOpenChange={() => setHiddenChangeSuccess(null)}
        title={`Successfully ${hiddenChangeSuccess === "restore" ? "restored" : "deleted"} FAQ`}
        subtext=""
        isSuccess={true}
      />
      <StatusDialog
        open={hiddenError != null && hiddenFaqs.length > 0}
        onOpenChange={() => setHiddenError(null)}
        title={`Could not ${hiddenError?.includes("restore") ? "restore" : "delete"} FAQ`}
        subtext={hiddenError ?? "An unknown error occurred"}
        isSuccess={false}
      />

      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-1 text-center">Frequently Asked Questions (admin)</h1>
        <Link to="/faq" className="text-primary hover:text-primary/90">Go back</Link>
        <div className="mb-6"></div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            if (v === TAB_HIDDEN_USER || v === TAB_HIDDEN_ADMIN) setHiddenLoading(true);
            setTabInUrl(v as ActiveTab);
          }}
          className="mb-6"
        >
          <TabsList className="w-full">
            <TabsTrigger value={TAB_PENDING} className="flex-1">Pending</TabsTrigger>
            <TabsTrigger value={TAB_HIDDEN_USER} className="flex-1">Hidden by User</TabsTrigger>
            <TabsTrigger value={TAB_HIDDEN_ADMIN} className="flex-1">Hidden by Admin</TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_PENDING} className="mt-4">
            {loading && (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <FaqCardSkeleton key={i} />)}
              </div>
            )}
            {!loading && faqs.length === 0 && (
              <h2 className="text-2xl font-bold my-2 text-center">No content!</h2>
            )}
            {faqs.map((faq) => (
              <PendingFaqCard
                key={faq.id}
                faq={faq}
                onExpand={() => handleExpand(faq.id)}
                onCollapse={handleCollapse}
                onShowDetail={() => handleShowDetail(faq)}
                expanded={expandedId === faq.id}
                onApprove={handleApprove}
                onDeny={handleDeny}
                onDelete={handleDeletePending}
              />
            ))}
            <Paginator<PendingFaqModel[]>
              pageCount={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onDataChanged={setFaqs}
              onPageChanged={async (pageNum) => {
                const res = await faqApiRef.current.getPending(pageNum - 1);
                if (res.data) {
                  setTotalPages(res.data.totalPages);
                  return res.data.faqs;
                }
                return [];
              }}
            />
          </TabsContent>

          <TabsContent value={TAB_HIDDEN_USER} className="mt-4">
            <HiddenFaqList
              faqs={hiddenFaqs}
              loading={hiddenLoading}
              error={hiddenError}
              expandedId={expandedHiddenId}
              onExpand={setExpandedHiddenId}
              onCollapse={() => setExpandedHiddenId(null)}
              onShowDetail={handleShowDetailHidden}
              onRestore={handleRestore}
              onDelete={handleDeleteHidden}
            />
            <Paginator<HiddenFaqModel[]>
              pageCount={hiddenTotalPages}
              currentPage={hiddenCurrentPage}
              setCurrentPage={setHiddenCurrentPage}
              onDataChanged={setHiddenFaqs}
              onPageChanged={async (pageNum) => {
                const res = await faqApiRef.current.getHiddenFaqs(hiddenType, pageNum - 1);
                if (res.data) {
                  setHiddenTotalPages(res.data.totalPages);
                  return res.data.faqs;
                }
                return [];
              }}
            />
          </TabsContent>

          <TabsContent value={TAB_HIDDEN_ADMIN} className="mt-4">
            <HiddenFaqList
              faqs={hiddenFaqs}
              loading={hiddenLoading}
              error={hiddenError}
              expandedId={expandedHiddenId}
              onExpand={setExpandedHiddenId}
              onCollapse={() => setExpandedHiddenId(null)}
              onShowDetail={handleShowDetailHidden}
              onRestore={handleRestore}
              onDelete={handleDeleteHidden}
            />
            <Paginator<HiddenFaqModel[]>
              pageCount={hiddenTotalPages}
              currentPage={hiddenCurrentPage}
              setCurrentPage={setHiddenCurrentPage}
              onDataChanged={setHiddenFaqs}
              onPageChanged={async (pageNum) => {
                const res = await faqApiRef.current.getHiddenFaqs(hiddenType, pageNum - 1);
                if (res.data) {
                  setHiddenTotalPages(res.data.totalPages);
                  return res.data.faqs;
                }
                return [];
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <FaqDialog
        detailFaq={detailFaq}
        content={faqContent.current}
        handleOpenChange={handleCloseDetail}
      />
    </div>
  );
};

function HiddenFaqList({
  faqs,
  loading,
  error,
  expandedId,
  onExpand,
  onCollapse,
  onShowDetail,
  onRestore,
  onDelete,
}: {
  faqs: HiddenFaqModel[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  onExpand: (id: number) => void;
  onCollapse: () => void;
  onShowDetail: (faq: HiddenFaqModel) => void;
  onRestore: (faq: HiddenFaqModel) => void;
  onDelete: (faq: HiddenFaqModel) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <FaqCardSkeleton key={i} />)}
      </div>
    );
  }
  if (faqs.length === 0) {
    return (
      <>
        <p className="text-center text-muted-foreground py-12">No hidden FAQs found.</p>
        {error && <p className="text-center text-destructive">{error}</p>}
      </>
    );
  }
  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <HiddenFaqCard
          key={faq.id}
          faq={faq}
          onExpand={() => onExpand(faq.id)}
          onCollapse={onCollapse}
          onShowDetail={() => onShowDetail(faq)}
          expanded={expandedId === faq.id}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}