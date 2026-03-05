import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import type { GetThreadsResponse } from "../../backend/models/api/GetThreadsResponse";
import { Paginator } from "../Paginator";

export type OrderBy = "newest" | "oldest" | "likes";

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

interface UserThreadsListProps {
  isLoadingWithInitialRender: boolean;
  filteredSortedThreads: ThreadModel[];
  searchText: string;
  searchDraft: string;
  onSearchDraftChange: (v: string) => void;
  orderBy: OrderBy;
  onOrderByChange: (v: OrderBy) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  threadsTotalPages: number;
  threadsCurrentPage: number;
  onCurrentPageChange: React.Dispatch<React.SetStateAction<number>>;
  onPageChanged: (page: number) => Promise<GetThreadsResponse>;
  onDataChanged: (data: GetThreadsResponse) => void;
}

export const UserThreadsList = ({
  isLoadingWithInitialRender,
  filteredSortedThreads,
  searchText,
  searchDraft,
  onSearchDraftChange,
  orderBy,
  onOrderByChange,
  onSearchSubmit,
  threadsTotalPages,
  threadsCurrentPage,
  onCurrentPageChange,
  onPageChanged,
  onDataChanged,
}: UserThreadsListProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Search & Filter */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <form className="flex-1 flex items-center gap-2" onSubmit={onSearchSubmit}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title..."
                value={searchDraft}
                onChange={(e) => onSearchDraftChange(e.target.value)}
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
                onOrderByChange(value);
                onCurrentPageChange(1);
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

      {/* Thread list */}
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
        setCurrentPage={onCurrentPageChange}
        onDataChanged={onDataChanged}
        onPageChanged={onPageChanged}
      />
    </>
  );
};
