import { Card } from "@/components/ui/card";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { VerifiedCheck } from "../badges/VerifiedCheck";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";
import { memo, useCallback, useMemo } from "react";
import { threadApi } from "@/net-fosterlink/backend/api/ThreadApi";
import { formatRelativeDate } from "@/net-fosterlink/util/DateUtil";
import { useLikeToggle } from "@/net-fosterlink/hooks/useLikeToggle";

interface ThreadPreviewProps {
    thread: ThreadModel,
    auth: AuthContextType,
    basePath?: string
}

export const ThreadPreviewWide = memo<ThreadPreviewProps>(({ thread, auth, basePath = "/threads/thread/" }) => {
  const apiCall = useCallback(() => threadApi(auth).likeThread(thread.id), [auth, thread.id]);
  const { isLiked, likeCount, likeInFlight, toggleLike } = useLikeToggle(thread.liked, thread.likeCount, apiCall);
  const navigate = useNavigate()

  const goToThread = useCallback(() => {
    navigate(`${basePath}${thread.id}`)
  }, [navigate, basePath, thread.id])

  const goToProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(buildProfileUrl(thread.author))
  }, [navigate, thread.author])

  const likeThread = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.isLoggedIn()) return;
    toggleLike();
  }, [auth, toggleLike])

  const visibleTags = useMemo(() => thread.tags ? thread.tags.slice(0, 3) : [], [thread.tags])

  return (
    <Card 
      className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-border"
      onClick={goToThread}
    >
      <div className="flex flex-col items-center mx-6 py-2 rounded-md bg-muted min-w-0 sm:min-w-[180px]">
        <button
          type="button"
          onClick={goToProfile}
          className="mb-3 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Avatar className="h-16 w-16">
            <AvatarImage src={thread.author.profilePictureUrl} alt={thread.author.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(thread.author.fullName)}
            </AvatarFallback>
          </Avatar>
        </button>
        
        <button
          type="button"
          onClick={goToProfile}
          className="flex items-center gap-1 mb-1 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-full px-1"
        >
          <span className="font-semibold text-sm">{thread.author.username}</span>
          {thread.author.verified && (
            <VerifiedCheck className="h-4 w-4" />
          )}
        </button>
        
        <div className="text-xs text-muted-foreground mb-3">
          {thread.author.fullName}
        </div>
        
        <div className="text-xs text-muted-foreground/80">
          {thread.userPostCount} posts
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {thread.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {thread.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-start gap-2 flex-wrap flex-col">
                        <span className="text-xs text-muted-foreground">
              Posted {formatRelativeDate(thread.createdAt)} at {new Date(thread.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex flex-row gap-2 items-center">
            {visibleTags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs bg-muted px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {thread.tags && thread.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">... and {thread.tags.length - 3} more</span>
            )}
            </div>

          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn()}>
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm disabled:text-muted-foreground text-foreground font-medium">
                {thread.commentCount}
              </span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn() || likeInFlight || auth.restricted} onClick={e => likeThread(e)}>
                {isLiked ? <>
                  <Heart fill="currentColor" className="h-4 w-4 text-destructive"/>
                  <span className="text-sm text-destructive">{likeCount}</span>
                </> : <>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{likeCount}</span>
                </>}
              </button>
          </div>
        </div>
      </div>
    </Card>
  );
});