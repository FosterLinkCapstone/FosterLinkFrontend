import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { HiddenFaqModel } from "../backend/models/HiddenFaqModel";
import type { FaqModel } from "../backend/models/FaqModel";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paginator } from "../components/Paginator";
import { faqApi } from "../backend/api/FaqApi";
import { StatusDialog } from "../components/StatusDialog";
import { confirm } from "../components/ConfirmDialog";
import { HiddenFaqCard } from "../components/faq/HiddenFaqCard";
import { FaqDialog } from "../components/faq/FaqDialog";

const TAB_USER = "user";
const TAB_ADMIN = "admin";
const TAB_PARAM = "tab";

type TabValue = typeof TAB_USER | typeof TAB_ADMIN;
type HiddenByFilter = "USER" | "ADMIN";

const tabToFilter = (tab: TabValue): HiddenByFilter => (tab === TAB_ADMIN ? "ADMIN" : "USER");

const isValidTab = (t: string | null): t is TabValue => t === TAB_USER || t === TAB_ADMIN;

export const HiddenFaqs = () => {
  const auth = useAuth();
  const faqApiRef = useRef(faqApi(auth));
  faqApiRef.current = faqApi(auth);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = (searchParams.get(TAB_PARAM) ?? TAB_USER).toLowerCase();
  const activeTab: TabValue = isValidTab(tabFromUrl) ? tabFromUrl : TAB_USER;
  const hiddenByFilter = tabToFilter(activeTab);

  const [faqs, setFaqs] = useState<HiddenFaqModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<"restore" | "delete" | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);
  const faqContent = useRef<string>("");

  useEffect(() => {
    setLoading(true);
    faqApiRef.current.getHiddenFaqs(hiddenByFilter, 0).then((res) => {
      if (!res.isError && res.data) {
        setFaqs(res.data.faqs);
        setTotalPages(res.data.totalPages);
        setCurrentPage(1);
        setError(null);
      } else {
        setFaqs([]);
        setTotalPages(0);
        setError(res.error ?? "Failed to fetch hidden FAQs");
      }
    }).finally(() => setLoading(false));
  }, [hiddenByFilter]);

  const setTabInUrl = (tab: TabValue) => {
    const next = new URLSearchParams(searchParams);
    next.set(TAB_PARAM, tab);
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (value: string) => {
    if (value === TAB_USER || value === TAB_ADMIN) {
      setLoading(true);
      setTabInUrl(value);
    }
  };

  const handleShowDetail = (faq: HiddenFaqModel) => {
    const asFaqModel: FaqModel = {
      id: faq.id,
      title: faq.title,
      summary: faq.summary,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
      author: faq.author,
      approvedByUsername: "",
    };
    faqApiRef.current.getContent(faq.id).then((res) => {
      if (!res.isError && res.data) {
        faqContent.current = res.data;
        setDetailFaq(asFaqModel);
      }
    });
  };

  const handleRestore = async (faq: HiddenFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to restore this FAQ? It will become visible to all users.",
    });
    if (confirmed) {
      faqApiRef.current.setFaqHidden(faq.id, false).then((res) => {
        if (!res.isError) {
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          setChangeSuccess("restore");
        } else {
          setError(res.error ?? "Failed to restore FAQ");
        }
      });
    }
  };

  const handleDelete = async (faq: HiddenFaqModel) => {
    const confirmed = await confirm({
      message: "Are you sure you want to permanently delete this FAQ? It will not be recoverable.",
    });
    if (confirmed) {
      faqApiRef.current.deleteHiddenFaq(faq.id).then((res) => {
        if (!res.isError) {
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          setChangeSuccess("delete");
        } else {
          setError(res.error ?? "Failed to delete FAQ");
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StatusDialog
        open={error != null && faqs.length > 0}
        onOpenChange={() => setError(null)}
        title={`Could not ${error?.includes("restore") ? "restore" : "delete"} FAQ`}
        subtext={error ?? "An unknown error occurred"}
        isSuccess={false}
      />
      <StatusDialog
        open={changeSuccess != null}
        onOpenChange={() => setChangeSuccess(null)}
        title={`Successfully ${changeSuccess === "restore" ? "restored" : "deleted"} FAQ`}
        subtext=""
        isSuccess={true}
      />

      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Hidden FAQs</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value={TAB_USER} className="flex-1">
              User
            </TabsTrigger>
            <TabsTrigger value={TAB_ADMIN} className="flex-1">
              Administrator
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
              </div>
            ) : (
              <FaqList
                faqs={faqs}
                error={error}
                expandedId={expandedId}
                onExpand={setExpandedId}
                onCollapse={() => setExpandedId(null)}
                onShowDetail={handleShowDetail}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            )}
          </TabsContent>
        </Tabs>

        <Paginator<HiddenFaqModel[]>
          pageCount={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onPageChanged={async (pageNum) => {
            const res = await faqApiRef.current.getHiddenFaqs(hiddenByFilter, pageNum - 1);
            if (res.data) {
              setTotalPages(res.data.totalPages);
              return res.data.faqs;
            }
            return [];
          }}
          onDataChanged={setFaqs}
        />
      </div>

      <FaqDialog
        detailFaq={detailFaq}
        content={faqContent.current}
        handleOpenChange={() => setDetailFaq(null)}
      />
    </div>
  );
};

function FaqList({
  faqs,
  error,
  expandedId,
  onExpand,
  onCollapse,
  onShowDetail,
  onRestore,
  onDelete,
}: {
  faqs: HiddenFaqModel[];
  error: string | null;
  expandedId: number | null;
  onExpand: (id: number) => void;
  onCollapse: () => void;
  onShowDetail: (faq: HiddenFaqModel) => void;
  onRestore: (faq: HiddenFaqModel) => void;
  onDelete: (faq: HiddenFaqModel) => void;
}) {
  return (
    <div className="space-y-4">
      {faqs.length === 0 ? (
        <>
          <p className="text-center text-muted-foreground py-12">No hidden FAQs found.</p>
          {error && <p className="text-center text-destructive">{error}</p>}
        </>
      ) : (
        faqs.map((faq) => (
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
        ))
      )}
    </div>
  );
}
