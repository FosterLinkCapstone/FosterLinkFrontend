import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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

type OrderBy = "newest" | "oldest" | "likes";

export const UserProfile = () => {
  const { userId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const threadApiRef = useMemo(() => threadApi(auth), [auth]);

  const [profileMetadata, setProfileMetadata] = useState<ProfileMetadataModel | null>(null);

  const [threads, setThreads] = useState<ThreadModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep typing responsive: only apply filtering on submit (Enter / Search button).
  const [searchDraft, setSearchDraft] = useState<string>("");
  const [searchText, setSearchText] = useState<string>(""); // applied value
  const [orderBy, setOrderBy] = useState<OrderBy>("newest");

  const numericUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  useEffect(() => {
    if (numericUserId === null) {
      setError("Invalid user id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      userApi(auth).getProfileMetadata(numericUserId),
      threadApiRef.randForUser(numericUserId)
    ]).then(([profileMetadataRes, threadRes]) => {
        if (!profileMetadataRes.isError && profileMetadataRes.data) {
          setProfileMetadata(profileMetadataRes.data);
        } else {
          setError(error !== null ? (error + " | ") : "" + profileMetadataRes.error || "Unable to load detailed user info.");
        }
      if (!threadRes.isError && threadRes.data) {
        setThreads(threadRes.data); 
        } else {
          setError(error !== null ? (error + " | ") : "" + threadRes.error || "Unable to load user posts.");
        }


    }).finally(() => {
      setLoading(false);
    });
  }, [numericUserId]);

  const displayThreads = useMemo(() => {
    let result = [...threads];

    if (searchText.trim() !== "") {
      const lower = searchText.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(lower));
    }

    result.sort((a, b) => {
      if (orderBy === "likes") {
        return b.likeCount - a.likeCount;
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return orderBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [threads, searchText, orderBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchDraft.trim());
  };

  const getJoinedText = () => {
    if (!profileMetadata?.user) return "";
    const created = new Date(profileMetadata.user.createdAt);
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

  const getJoinedTooltip = () => {
    if (!profileMetadata?.user) return "";
    const created = new Date(profileMetadata.user.createdAt);
    const month = String(created.getMonth() + 1).padStart(2, "0");
    const day = String(created.getDate()).padStart(2, "0");
    const year = created.getFullYear();
    return `Joined on ${month}/${day}/${year}`;
  };

  const handleAgencyClick = () => {
    navigate(`/agencies/#${profileMetadata?.agencyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
          <Navbar userInfo={auth.getUserInfo()} />
        </div>
        <div className="flex items-center justify-center py-24">
          <span className="text-gray-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profileMetadata?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
          <Navbar userInfo={auth.getUserInfo()} />
        </div>
        <div className="flex items-center justify-center py-24">
          <span className="text-red-500">{error || "User not found."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-10">
          <Avatar className="h-28 w-28 mb-4">
            <AvatarImage src={profileMetadata.user.profilePictureUrl} alt={profileMetadata.user.username} />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
              {getInitials(profileMetadata.user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold">{profileMetadata.user.fullName}</h1>
            {profileMetadata.user.verified && (
              <VerifiedCheck className="h-5 w-5" />
            )}
          </div>

          <div className="text-gray-600 mb-2">@{profileMetadata.user.username}</div>

          <div
            className="text-sm text-gray-500 mb-4"
            title={getJoinedTooltip()}
          >
            {getJoinedText()}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {profileMetadata?.admin && (
              <Badge className="px-4 py-1 rounded-full border-yellow-400 bg-yellow-100 text-yellow-800">
                Administrator
              </Badge>
            )}
            {(profileMetadata?.faqAuthor) && (
              <Badge className="px-4 py-1 rounded-full border-green-400 bg-green-100 text-green-800">
                FAQ Author
              </Badge>
            )}
            {(profileMetadata?.agencyName !== null) && (
              <Badge
                className="px-4 py-1 rounded-full border-blue-400 bg-blue-100 text-blue-800 cursor-pointer"
                title={profileMetadata?.agencyName ? `User is an agent of ${profileMetadata.agencyName}` : undefined}
                onClick={handleAgencyClick}
              >
                Agency Rep
              </Badge>
            )}
          </div>
        </div>

        <Card className="p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <form className="flex-1 flex items-center gap-2" onSubmit={handleSearchSubmit}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            <div className="w-full md:w-48 bg-white">
              <Select
                value={orderBy}
                onValueChange={(value: OrderBy) => setOrderBy(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Order By" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="likes">Most liked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {displayThreads.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {
                searchText !== "" ? "No posts found matching your search." : "This user hasn't posted any threads yet."
              }
            </div>
          ) : (
            displayThreads.map((t) => (
              <Card
                key={t.id}
                className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => navigate(`/threads/thread/${t.id}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg text-left font-semibold mb-1">{t.title}</h3>
                    <p className="text-sm text-left text-gray-600 line-clamp-2">
                      {t.content}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>
                      {new Date(t.createdAt).toLocaleDateString()}{" "}
                      {new Date(t.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-1">{t.likeCount} likes</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


