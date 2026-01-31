import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { SearchBy } from "../backend/models/api/SearchBy";
import { ThreadPreviewWide } from "../components/forum/ThreadPreviewWide";
import { ThreadPreviewSkeleton } from "../components/forum/ThreadPreviewSkeleton";
import { CreateThreadCardWide } from "../components/forum/CreateThreadCardWide";
import { useNavigate, useSearchParams } from "react-router";
import { Paginator } from "../components/Paginator";

type OrderBy = "newest" | "oldest" | "likes";

export const Threads = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>(SearchBy.THREAD_TITLE);
  const [orderBy, setOrderBy] = useState<OrderBy>("newest");
  const [threads, setThreads] = useState<ThreadModel[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [searchParams] = useSearchParams()
  const [searching, setSearching] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [creating, setCreating] = useState<boolean>(searchParams.get("creating") === "true")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const auth = useAuth()
  const threadApiRef = useRef(threadApi(auth))
  const navigate = useNavigate()

  const orderByToApi = (o: OrderBy): "most liked" | "oldest" | "newest" => {
    switch (o) {
      case "likes":
        return "most liked";
      case "oldest":
        return "oldest";
      case "newest":
      default:
        return "newest";
    }
  };

  const loadThreads = useCallback(async (o: OrderBy) => {
    const res = await threadApiRef.current.getThreads(orderByToApi(o), 0);
    if (!res.isError && res.data) {
      setThreads(res.data.threads);
      setTotalPages(res.data.totalPages);
      setCurrentPage(1);
      setLoading(false);
    }
  }, [threadApiRef]);

  /*useEffect(() => {
    if (threads.length === 0 && !searching) {
      loadThreads(orderBy);
    }
  }, [loadThreads, orderBy, threads.length]);*/

  useEffect(() => {
    // Only refetch when order changes AND search is empty.
    if (!searching && searchText.trim() === "") {
      setCurrentPage(1);
      loadThreads(orderBy);
    } else {
          const result = [...threads];
          result.sort((a, b) => {
            if (orderBy === "likes") {
              return b.likeCount - a.likeCount;
            }
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return orderBy === "newest" ? dateB - dateA : dateA - dateB;
        });
        setCurrentPage(1);
        setThreads(result);
    }
  }, [orderBy, searchText, loadThreads, searching]);

  const displayThreads = useMemo(() => threads, [threads]);

  const doSearch = async () => {
    if (searchText.trim() !== "" && searchBy !== "") {
        setSearching(true)
        setCurrentPage(1)
        const res = await threadApiRef.current.search(SearchBy[searchBy as keyof typeof SearchBy], searchText, 0)
        if (res.errorMessage && res.errorMessage != "") {
            setError(res.errorMessage)
            setTotalPages(1)
        } else {
            const list = res.response ?? []
            list.sort((a, b) => {
              if (orderBy === "likes") {
                return b.likeCount - a.likeCount;
              }
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return orderBy === "newest" ? dateB - dateA : dateA - dateB;
            });
            setThreads(list)
            setTotalPages(list.length >= 10 ? 2 : 1)
        }
    } else {
      setSearching(false)
    }
  }
  const onThreadCreate = (newThread: ThreadModel) => {
    setCreating(false)
    navigate(`/threads/thread/${newThread.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
          <Navbar userInfo={auth.getUserInfo()} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 min-w-[120px] w-[120px] rounded-md" />
            <Skeleton className="h-9 min-w-[120px] w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[80px] rounded-md" />
          </div>
          {auth.isLoggedIn() && (
            <div className="max-w-7xl mb-6">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          )}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <ThreadPreviewSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6">
          <Input
            type="text"
            placeholder="Enter search text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />

          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="Search By" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectItem value="THREAD_TITLE">Thread Title</SelectItem>
              <SelectItem value="THREAD_CONTENT">Thread Content</SelectItem>
              <SelectItem value="USERNAME">Username</SelectItem>
              <SelectItem value="TAGS">Tags</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orderBy} onValueChange={(value: OrderBy) => setOrderBy(value)}>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="Order By" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="likes">Most liked</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="whitespace-nowrap" onClick={doSearch}>Search</Button>
        </div>
        {
          auth.isLoggedIn() && <div className="max-w-7xl mb-6">
                                  <Button className="w-full !border-solid !border-1" onClick={() => setCreating(!creating)}>Create Thread</Button>
                                </div>
        }

        {
            error !== '' && <h4 style={{color: 'red'}}>{error}</h4>
        }

        <div className="space-y-4">
            {
              creating && <CreateThreadCardWide onCancel={() => setCreating(false)} onCreate={onThreadCreate}/>
            }
            {
                displayThreads.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : displayThreads.map(t => <ThreadPreviewWide key={t.id} thread={t} auth={auth}/>)
            }
        </div>
        {(searching ? (
          <Paginator<ThreadModel[]>
            pageCount={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onDataChanged={setThreads}
            onPageChanged={async (pageNum) => {
              const res = await threadApiRef.current.search(SearchBy[searchBy as keyof typeof SearchBy], searchText, pageNum - 1);
              const data = res.response ?? [];
              setTotalPages(data.length >= 10 ? pageNum + 1 : pageNum);
              return data;
            }}
          />
        ) : (
          <Paginator<ThreadModel[]>
            pageCount={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onDataChanged={setThreads}
            onPageChanged={async (pageNum) => {
              const res = await threadApiRef.current.getThreads(orderByToApi(orderBy), pageNum - 1);
              const payload = res.data;
              const data = payload?.threads ?? [];
              if (payload) {
                setTotalPages(payload.totalPages);
              }
              return data;
            }}
          />
        ))}
      </div>
    </div>
  );
};