import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { threadApi } from "../backend/api/ThreadApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { getInitials } from "../util/StringUtil";
import type { ProfileMetadataModel } from "../backend/models/ProfileMetadataModel";
import { userApi } from "../backend/api/UserApi";
import { VerifiedCheck } from "../components/VerifiedCheck";
import type { FaqModel } from "../backend/models/FaqModel";
import { faqApi } from "../backend/api/FaqApi";
import { Paginator } from "../components/Paginator";
import type { GetThreadsResponse } from "../backend/models/api/GetThreadsResponse";

type OrderBy = "newest" | "oldest" | "likes";

// Helper to safely decode URI component
const decodeParam = (param: string | undefined): string =>
  param ? decodeURIComponent(param) : "";

// Helper to format join date as relative text
const formatJoinedText = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const created = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(created.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  if (years > 0) {
    return `Joined ${years} year${years === 1 ? "" : "s"} ago`;
  }
  return `Joined ${months <= 0 ? 1 : months} month${months === 1 ? "" : "s"} ago`;
};

// Helper to format join date as tooltip
const formatJoinedTooltip = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const created = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(created.getTime())) return "";

  const month = String(created.getMonth() + 1).padStart(2, "0");
  const day = String(created.getDate()).padStart(2, "0");
  const year = created.getFullYear();
  return `Joined on ${month}/${day}/${year}`;
};

// testing global page layout for reduced boilerplate
const PageLayout: React.FC<{ auth: ReturnType<typeof useAuth>; children: React.ReactNode }> = ({ auth, children }) => (
  <div className="min-h-screen bg-background">
    <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
      <Navbar userInfo={auth.getUserInfo()} />
    </div>
    {children}
  </div>
);

// Skeleton card for loading state
const ThreadCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-muted/50 rounded animate-pulse" />
        <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
      </div>
      <div className="space-y-1">
        <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
        <div className="h-3 w-12 bg-muted/30 rounded animate-pulse" />
      </div>
    </div>
  </Card>
);

export const UserProfile = () => {
  const { userId  } = useParams();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const threadApiRef = useMemo(() => threadApi(auth), [auth]);

  const [profileMetadata, setProfileMetadata] = useState<ProfileMetadataModel | null>(null);
  const [faqResponses, setFaqResponses] = useState<FaqModel[]>([]);
  const [threads, setThreads] = useState<ThreadModel[]>([]);
  const [threadsTotalPages, setThreadsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("newest");
  const [threadsCurrentPage, setThreadsCurrentPage] = useState(1);

  const numericUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  // Decode URL params once
  const initialData = useMemo(() => ({
    username: decodeParam(searchParams.get("username") || undefined),
    fullName: decodeParam(searchParams.get("fullName") || undefined),
    joinDate: decodeParam(searchParams.get("joinDate") || undefined),
    profilePicUrl: searchParams.get("profilePicUrl") ? decodeURIComponent(searchParams.get("profilePicUrl")!) : undefined,
  }), [searchParams]);

  const canDoInitialRender = !!(initialData.username && initialData.fullName && initialData.joinDate);

  // Computed display values with fallbacks
  const display = useMemo(() => {
    const user = profileMetadata?.user;
    const joinDateSource = user?.createdAt ?? initialData.joinDate;

    return {
      username: user?.username ?? initialData.username,
      fullName: user?.fullName ?? initialData.fullName,
      profilePicUrl: user?.profilePictureUrl ?? initialData.profilePicUrl,
      joinedText: formatJoinedText(joinDateSource),
      joinedTooltip: formatJoinedTooltip(joinDateSource),
      verified: user?.verified ?? false,
    };
  }, [profileMetadata?.user, initialData]);

  useEffect(() => {
    if (numericUserId === null) {
      setError("Invalid user id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const appendError = (current: string | null, message: string) =>
      current ? `${current} | ${message}` : message;

    Promise.all([
      userApi(auth).getProfileMetadata(numericUserId),
      threadApiRef.searchByUser(numericUserId, 0)
    ]).then(([profileRes, threadRes]) => {
      if (!profileRes.isError && profileRes.data) {
        setProfileMetadata(profileRes.data);
      } else {
        setError(prev => appendError(prev, profileRes.error || "Unable to load detailed user info."));
      }

      if (!threadRes.isError && threadRes.data) {
        setThreads(threadRes.data.threads);
        setThreadsTotalPages(threadRes.data.totalPages);
      } else {
        setError(prev => appendError(prev, threadRes.error || "Unable to load user posts."));
      }
    }).finally(() => setLoading(false));

    faqApi(auth).allAuthor(numericUserId).then(res => {
      if (!res.isError && res.data) {
        setFaqResponses(res.data);
      }
    });
  }, [numericUserId, auth, threadApiRef]);

  const filteredSortedThreads = useMemo(() => {
    let result = [...threads];

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      if (orderBy === "likes") return b.likeCount - a.likeCount;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return orderBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [threads, searchText, orderBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchDraft.trim());
    setThreadsCurrentPage(1);
  };

  const handleAgencyClick = () => {
    navigate(`/agencies/?agencyId=${profileMetadata?.agencyId}`);
  };

  const handlePageChange = async (pageNumber: number): Promise<GetThreadsResponse> => {
    const res = await threadApiRef.searchByUser(numericUserId!, pageNumber - 1);
    if (!res.isError && res.data) {
      return res.data;
    }
    setError(prev => prev ? `${prev} | ${res.error}` : res.error || "Unable to load user posts.");
    return { threads: [], totalPages: 1 };
  };

  // Show loading state only if we can't do initial render
  if (loading && !canDoInitialRender) {
    return (
      <PageLayout auth={auth}>
        <div className="flex items-center justify-center py-24">
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </PageLayout>
    );
  }

  // Show error only if we have no initial render data to fall back on
  if ((error || !profileMetadata?.user) && !canDoInitialRender && !loading) {
    return (
      <PageLayout auth={auth}>
        <div className="flex items-center justify-center py-24">
          <span className="text-destructive">{error || "User not found."}</span>
        </div>
      </PageLayout>
    );
  }

  const isLoadingWithInitialRender = loading && canDoInitialRender;

  return (
    <PageLayout auth={auth}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <Avatar className="h-28 w-28 mb-4">
            <AvatarImage src={display.profilePicUrl} alt={display.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {getInitials(display.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold">{display.fullName}</h1>
            {display.verified && <VerifiedCheck className="h-5 w-5" />}
          </div>

          <div className="text-muted-foreground mb-2">@{display.username}</div>

          <div className="text-sm text-muted-foreground mb-4" title={display.joinedTooltip}>
            {display.joinedText}
          </div>

          {/* Badges - only shown after full profile loads */}
          {profileMetadata && (
            <div className="flex flex-wrap justify-center gap-2">
              {profileMetadata.admin && (
                <Badge className="px-4 py-1 rounded-full border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                  Administrator
                </Badge>
              )}
              {profileMetadata.faqAuthor && (
                <Badge className="px-4 py-1 rounded-full border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                  FAQ Author
                </Badge>
              )}
              {profileMetadata.agencyName !== null && (
                <Badge
                  className="px-4 py-1 rounded-full border-primary/50 bg-primary/10 text-primary cursor-pointer dark:bg-primary/30 dark:text-primary-foreground dark:border-primary/60"
                  title={profileMetadata.agencyName ? `User is an agent of ${profileMetadata.agencyName}${profileMetadata.agencyCount > 1 ? ` + ${profileMetadata.agencyCount - 1} more` : ''}` : undefined}
                  onClick={handleAgencyClick}
                >
                  Agency Rep
                </Badge>
              )}
            </div>
          )}
          {isLoadingWithInitialRender && (
            <div className="h-6 w-32 bg-muted/50 rounded-full animate-pulse" />
          )}
        </div>

        {/* Search & Filter */}
        <Card className="p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <form className="flex-1 flex items-center gap-2" onSubmit={handleSearchSubmit}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts by title..."
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" className="whitespace-nowrap">
                Search
              </Button>
            </form>
            <div className="w-full md:w-48">
              <Select
                value={orderBy}
                onValueChange={(value: OrderBy) => {
                  setOrderBy(value);
                  setThreadsCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order By" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="likes">Most liked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Threads List */}
        <div className="space-y-3">
          {isLoadingWithInitialRender ? (
            [1, 2, 3].map((i) => <ThreadCardSkeleton key={i} />)
          ) : filteredSortedThreads.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchText ? "No posts found matching your search." : "This user hasn't posted any threads yet."}
            </div>
          ) : (
            filteredSortedThreads.map((t) => (
              <Card
                key={t.id}
                className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => navigate(`/threads/thread/${t.id}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg text-left font-semibold mb-1">{t.title}</h3>
                    <p className="text-sm text-left text-muted-foreground line-clamp-2">{t.content}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>
                      {new Date(t.createdAt).toLocaleDateString()}{" "}
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-1">{t.likeCount} likes</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Paginator<GetThreadsResponse>
          pageCount={threadsTotalPages}
          currentPage={threadsCurrentPage}
          setCurrentPage={setThreadsCurrentPage}
          onDataChanged={(data) => {
            setThreads(data.threads);
            setThreadsTotalPages(data.totalPages);
          }}
          onPageChanged={handlePageChange}
        />

        {/* FAQ Responses */}
        {faqResponses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">FAQ Responses</h2>
            <div className="space-y-3">
              {faqResponses.map((faq) => (
                <Card key={faq.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{faq.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{faq.summary}</p>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/faq?openId=${faq.id}`)}
                        className="text-sm"
                      >
                        View More
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
