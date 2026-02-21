import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { HiddenThreadModel } from "../backend/models/HiddenThreadModel";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Paginator } from "../components/Paginator";
import { threadApi } from "../backend/api/ThreadApi";
import { ThreadPreviewWide } from "../components/forum/ThreadPreviewWide";
import { StatusDialog } from "../components/StatusDialog";
import { confirm } from "../components/ConfirmDialog";

const TAB_USER = "user";
const TAB_ADMIN = "admin";
const TAB_PARAM = "tab";

type TabValue = typeof TAB_USER | typeof TAB_ADMIN;
type HiddenByFilter = "USER" | "ADMIN";

const tabToFilter = (tab: TabValue): HiddenByFilter => (tab === TAB_ADMIN ? "ADMIN" : "USER");

const isValidTab = (t: string | null): t is TabValue => t === TAB_USER || t === TAB_ADMIN;

export const HiddenThreads = () => {
  const auth = useAuth();
  const threadApiRef = useRef(threadApi(auth));
  threadApiRef.current = threadApi(auth);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = (searchParams.get(TAB_PARAM) ?? TAB_USER).toLowerCase();
  const activeTab: TabValue = isValidTab(tabFromUrl) ? tabFromUrl : TAB_USER;
  const hiddenByFilter = tabToFilter(activeTab);

  const [threads, setThreads] = useState<HiddenThreadModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<"restore" | "delete" | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    threadApiRef.current.getHiddenThreads(hiddenByFilter, 0).then((res) => {
      if (!res.isError && res.data) {
        setThreads(res.data.threads);
        setTotalPages(res.data.totalPages);
        setCurrentPage(1);
        setError(null);
      } else {
        setThreads([]);
        setTotalPages(0);
        setError(res.error ?? "Failed to fetch hidden threads");
      }
    });
  }, [hiddenByFilter]);

  const setTabInUrl = (tab: TabValue) => {
    const next = new URLSearchParams(searchParams);
    next.set(TAB_PARAM, tab);
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (value: string) => {
    if (value === TAB_USER || value === TAB_ADMIN) {
      setTabInUrl(value);
    }
  };

  const handleRestore = async (threadId: number) => {
    const confirmed = await confirm({
      message:
        "Are you sure you want to restore this thread? It will become visible to all users.",
    });
    if (confirmed) {
      threadApiRef.current.setThreadHidden(threadId, false).then((res) => {
        if (!res.isError) {
          setThreads((prev) => prev.filter((t) => t.id !== threadId));
          setChangeSuccess("restore");
        } else {
          setError(res.error ?? "Failed to restore thread");
        }
      });
    }
  };

  const handleDelete = async (threadId: number) => {
    const confirmed = await confirm({
      message: "Are you sure you want to delete this thread? It will not be recoverable.",
    });
    if (confirmed) {
      threadApiRef.current.deleteHiddenThread(threadId).then((res) => {
        if (!res.isError) {
          setThreads((prev) => prev.filter((t) => t.id !== threadId));
          setChangeSuccess("delete");
        } else {
          setError(res.error ?? "Failed to delete thread");
        }
      });
    }
  };

  const getHiddenByName = (thread: HiddenThreadModel) => {
    return thread.postMetadata.hiddenBy ?? thread.author.username;
  };

  return (
    <div className="min-h-screen bg-background">
      <StatusDialog
        open={error != null && threads.length > 0}
        onOpenChange={() => setError(null)}
        title={`Could not ${error?.includes("restore") ? "restore" : "delete"} thread`}
        subtext={error ?? "An unknown error occurred"}
        isSuccess={false}
      />
      <StatusDialog
        open={changeSuccess != null}
        onOpenChange={() => setChangeSuccess(null)}
        title={`Successfully ${changeSuccess === "restore" ? "restored" : "deleted"} thread`}
        subtext=""
        isSuccess={true}
      />

      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Hidden Threads</h1>

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
            <ThreadList
              threads={threads}
              error={error}
              auth={auth}
              getHiddenByName={getHiddenByName}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>

        <Paginator<HiddenThreadModel[]>
          pageCount={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onPageChanged={async (_pageNum) => {
            return [];
          }}
          onDataChanged={(_data) => {}}
        />
      </div>
    </div>
  );
};

function ThreadList({
  threads,
  error,
  auth,
  getHiddenByName,
  onRestore,
  onDelete,
}: {
  threads: HiddenThreadModel[];
  error: string | null;
  auth: ReturnType<typeof useAuth>;
  getHiddenByName: (t: HiddenThreadModel) => string;
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      {threads.length === 0 ? (
        <>
          <p className="text-center text-muted-foreground py-12">No hidden threads found.</p>
          {error && <p className="text-center text-destructive">{error}</p>}
        </>
      ) : (
        threads.map((thread) => (
          <div key={thread.id} className="flex flex-col w-full gap-1">
            <Alert
              className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70"
              variant="destructive"
            >
              <AlertCircleIcon />
              <AlertTitle>Hidden by {getHiddenByName(thread)}</AlertTitle>
            </Alert>

            <ThreadPreviewWide thread={thread} auth={auth} basePath="/threads/hidden/thread/" />

            <div className="w-full flex flex-col mt-1 gap-2">
              <Button
                variant="outline"
                className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/50 dark:text-emerald-50 dark:border-emerald-400/70 hover:bg-emerald-200 dark:hover:bg-emerald-500/70"
                onClick={() => onRestore(thread.id)}
              >
                Restore
              </Button>
              <Button
                variant="outline"
                className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                onClick={() => onDelete(thread.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
