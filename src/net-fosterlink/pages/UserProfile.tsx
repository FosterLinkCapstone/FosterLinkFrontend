import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "../backend/AuthContext";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { threadApi } from "../backend/api/ThreadApi";
import { userApi } from "../backend/api/UserApi";
import type { ProfileMetadataModel } from "../backend/models/ProfileMetadataModel";
import { faqApi } from "../backend/api/FaqApi";
import type { FaqModel } from "../backend/models/FaqModel";
import type { GetThreadsResponse } from "../backend/models/api/GetThreadsResponse";
import type { GetFaqsResponse } from "../backend/models/api/GetFaqsResponse";
import { accountDeletionApi } from "../backend/api/AccountDeletionApi";
import type { AccountDeletionRequestModel } from "../backend/models/AccountDeletionRequestModel";
import { StatusDialog } from "../components/StatusDialog";
import { confirm } from "../components/ConfirmDialog";
import { PageLayout } from "../components/PageLayout";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { UserThreadsList } from "../components/profile/UserThreadsList";
import type { OrderBy } from "../components/profile/UserThreadsList";
import { UserFaqSection } from "../components/profile/UserFaqSection";
import { formatJoinedText, formatJoinedTooltip } from "../util/DateUtil";

const decodeParam = (param: string | undefined): string =>
  param ? decodeURIComponent(param) : "";

export const UserProfile = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const threadApiRef = useMemo(() => threadApi(auth), [auth]);
  const deletionApiRef = useRef(accountDeletionApi(auth));
  deletionApiRef.current = accountDeletionApi(auth);

  const [profileMetadata, setProfileMetadata] = useState<ProfileMetadataModel | null>(null);
  const [faqResponses, setFaqResponses] = useState<FaqModel[]>([]);
  const [faqsTotalPages, setFaqsTotalPages] = useState(1);
  const [faqsCurrentPage, setFaqsCurrentPage] = useState(1);
  const [threads, setThreads] = useState<ThreadModel[]>([]);
  const [threadsTotalPages, setThreadsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailFaq, setDetailFaq] = useState<FaqModel | null>(null);
  const detailFaqContent = useRef("");

  const [searchDraft, setSearchDraft] = useState("");
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState<OrderBy>("newest");
  const [threadsCurrentPage, setThreadsCurrentPage] = useState(1);

  const [myDeletionRequest, setMyDeletionRequest] = useState<AccountDeletionRequestModel | null | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState<{ msg: string; success: boolean } | null>(null);

  const numericUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  const initialData = useMemo(() => ({
    username: decodeParam(searchParams.get("username") || undefined),
    fullName: decodeParam(searchParams.get("fullName") || undefined),
    joinDate: decodeParam(searchParams.get("joinDate") || undefined),
    profilePicUrl: searchParams.get("profilePicUrl") ? decodeURIComponent(searchParams.get("profilePicUrl")!) : undefined,
  }), [searchParams]);

  const canDoInitialRender = !!(initialData.username && initialData.fullName && initialData.joinDate);

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
      banned: user?.banned ?? false,
      restricted: user?.restricted ?? false,
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
      threadApiRef.searchByUser(numericUserId, 0),
    ]).then(([profileRes, threadRes]) => {
      if (profileRes.isError) {
        navigate("/not-found", { replace: true });
        return;
      }

      if (!profileRes.isError && profileRes.data) {
        setProfileMetadata(profileRes.data);
      } else {
        setError(prev => appendError(prev, profileRes.error || "Unable to load detailed user info."));
      }

      if (!threadRes.isError && threadRes.data) {
        setThreads(threadRes.data.items);
        setThreadsTotalPages(threadRes.data.totalPages);
      } else {
        setError(prev => appendError(prev, threadRes.error || "Unable to load user posts."));
      }
    }).finally(() => setLoading(false));

    faqApi(auth).allAuthor(numericUserId, 0).then(res => {
      if (!res.isError && res.data) {
        setFaqResponses(res.data.items);
        setFaqsTotalPages(res.data.totalPages);
        setFaqsCurrentPage(1);
      } else {
        setFaqResponses([]);
        setFaqsTotalPages(1);
      }
    });
  }, [numericUserId, auth, threadApiRef]);

  const currentUserId = auth.getUserInfo()?.id;
  const isOwnProfile = !!currentUserId && !!numericUserId && currentUserId === numericUserId;

  useEffect(() => {
    if (!isOwnProfile || !auth.isLoggedIn()) {
      setMyDeletionRequest(null);
      return;
    }
    deletionApiRef.current.getMyRequest().then(res => {
      if (!res.isError) {
        setMyDeletionRequest(res.data ?? null);
      } else {
        setMyDeletionRequest(null);
      }
    });
  }, [isOwnProfile, auth]);

  const handleCancelDeletion = async () => {
    const confirmed = await confirm({
      message: "Are you sure you want to cancel your account deletion request? Your account will be unlocked and remain active.",
    });
    if (!confirmed) return;
    const res = await deletionApiRef.current.cancelDeletion();
    if (!res.isError) {
      setMyDeletionRequest(null);
      setStatusMsg({ msg: "Your deletion request has been cancelled. Your account is now active.", success: true });
    } else {
      setStatusMsg({ msg: res.error ?? "Failed to cancel deletion request.", success: false });
    }
  };

  const handleBan = async () => {
    if (!numericUserId) return;
    const confirmed = await confirm({ message: `Are you sure you want to ban ${display.username}? They will be locked out of their account.` });
    if (!confirmed) return;
    const res = await userApi(auth).banUser(numericUserId);
    if (!res.isError) {
      setProfileMetadata(prev => prev ? { ...prev, user: { ...prev.user, banned: true } } : prev);
      setStatusMsg({ msg: "User has been banned.", success: true });
    } else {
      setStatusMsg({ msg: res.error ?? "Failed to ban user.", success: false });
    }
  };

  const handleUnban = async () => {
    if (!numericUserId) return;
    const confirmed = await confirm({ message: `Are you sure you want to unban ${display.username}?` });
    if (!confirmed) return;
    const res = await userApi(auth).unbanUser(numericUserId);
    if (!res.isError) {
      setProfileMetadata(prev => prev ? { ...prev, user: { ...prev.user, banned: false } } : prev);
      setStatusMsg({ msg: "User has been unbanned.", success: true });
    } else {
      setStatusMsg({ msg: res.error ?? "Failed to unban user.", success: false });
    }
  };

  const handleRestrict = async () => {
    if (!numericUserId) return;
    const confirmed = await confirm({ message: `Are you sure you want to restrict ${display.username}?` });
    if (!confirmed) return;
    const res = await userApi(auth).restrictUser(numericUserId);
    if (!res.isError) {
      setProfileMetadata(prev => prev ? { ...prev, user: { ...prev.user, restricted: true } } : prev);
      setStatusMsg({ msg: "User has been restricted.", success: true });
    } else {
      setStatusMsg({ msg: res.error ?? "Failed to restrict user.", success: false });
    }
  };

  const handleUnrestrict = async () => {
    if (!numericUserId) return;
    const confirmed = await confirm({ message: `Are you sure you want to unrestrict ${display.username}?` });
    if (!confirmed) return;
    const res = await userApi(auth).unrestrictUser(numericUserId);
    if (!res.isError) {
      setProfileMetadata(prev => prev ? { ...prev, user: { ...prev.user, restricted: false } } : prev);
      setStatusMsg({ msg: "User has been unrestricted.", success: true });
    } else {
      setStatusMsg({ msg: res.error ?? "Failed to unrestrict user.", success: false });
    }
  };

  const loadFaqContent = async (faqId: number): Promise<void> => {
    const content = await faqApi(auth).getContent(faqId);
    if (!content.isError && content.data) {
      detailFaqContent.current = content.data;
    }
  };

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

  const handlePageChange = async (pageNumber: number): Promise<GetThreadsResponse> => {
    const res = await threadApiRef.searchByUser(numericUserId!, pageNumber - 1);
    if (!res.isError && res.data) {
      return res.data;
    }
    setError(prev => prev ? `${prev} | ${res.error}` : res.error || "Unable to load user posts.");
    return { items: [], totalPages: 1 };
  };

  const handleFaqPageChange = async (pageNumber: number): Promise<GetFaqsResponse> => {
    const res = await faqApi(auth).allAuthor(numericUserId!, pageNumber - 1);
    if (!res.isError && res.data) {
      return res.data;
    }
    return { items: [], totalPages: 1 };
  };

  const isLoadingWithInitialRender = loading && canDoInitialRender;

  if (loading && !canDoInitialRender) {
    return (
      <PageLayout auth={auth}>
        <div className="flex items-center justify-center py-24">
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </PageLayout>
    );
  }

  if ((error || !profileMetadata?.user) && !canDoInitialRender && !loading) {
    return (
      <PageLayout auth={auth}>
        <div className="flex items-center justify-center py-24">
          <span className="text-destructive">{error || "User not found."}</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout auth={auth}>
      <title>{display.username}</title>
      <StatusDialog
        open={!!statusMsg}
        onOpenChange={() => setStatusMsg(null)}
        title={statusMsg?.msg ?? ""}
        subtext=""
        isSuccess={statusMsg?.success ?? false}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader
          display={display}
          profileMetadata={profileMetadata}
          isOwnProfile={isOwnProfile}
          isLoadingWithInitialRender={isLoadingWithInitialRender}
          myDeletionRequest={myDeletionRequest}
          auth={auth}
          onBan={handleBan}
          onUnban={handleUnban}
          onRestrict={handleRestrict}
          onUnrestrict={handleUnrestrict}
          onCancelDeletion={handleCancelDeletion}
          onAgencyClick={() => navigate(`/agencies/?agencyId=${profileMetadata?.agencyId}`)}
          onNavigateAdmin={() => navigate(`/admin/users?searchBy=USERNAME&query=${encodeURIComponent(display.username)}`)}
        />

        <UserThreadsList
          isLoadingWithInitialRender={isLoadingWithInitialRender}
          filteredSortedThreads={filteredSortedThreads}
          searchText={searchText}
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          orderBy={orderBy}
          onOrderByChange={setOrderBy}
          onSearchSubmit={handleSearchSubmit}
          threadsTotalPages={threadsTotalPages}
          threadsCurrentPage={threadsCurrentPage}
          onCurrentPageChange={setThreadsCurrentPage}
          onPageChanged={handlePageChange}
          onDataChanged={(data) => {
            setThreads(data.items);
            setThreadsTotalPages(data.totalPages);
          }}
        />

        <UserFaqSection
          faqAuthor={profileMetadata?.faqAuthor ?? false}
          faqResponses={faqResponses}
          faqsTotalPages={faqsTotalPages}
          faqsCurrentPage={faqsCurrentPage}
          onCurrentPageChange={setFaqsCurrentPage}
          onPageChanged={handleFaqPageChange}
          onDataChanged={(data) => {
            setFaqResponses(data.items);
            setFaqsTotalPages(data.totalPages);
          }}
          onViewFaq={(faq) => {
            loadFaqContent(faq.id).then(() => setDetailFaq(faq));
          }}
          detailFaq={detailFaq}
          detailFaqContent={detailFaqContent.current}
          onCloseFaqDialog={() => setDetailFaq(null)}
        />
      </div>
    </PageLayout>
  );
};
