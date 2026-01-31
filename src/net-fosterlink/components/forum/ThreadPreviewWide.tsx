import { Card } from "@/components/ui/card";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { VerifiedCheck } from "../VerifiedCheck";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";
import { useState } from "react";
import { threadApi } from "@/net-fosterlink/backend/api/ThreadApi";

interface ThreadPreviewProps {
    thread: ThreadModel,
    auth: AuthContextType
}

export const ThreadPreviewWide: React.FC<ThreadPreviewProps> = ({ thread, auth }) => {
  const [isLiked, setIsLiked] = useState<boolean>(thread.liked);
  const formatDate = (jsonDate: Date) => {
    const date = new Date(jsonDate)
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return `on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const navigate = useNavigate()

  const goToThread = () => {
    navigate(`/threads/thread/${thread.id}`)
  }

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/users/${thread.author.id}`)
  }
  const likeThread = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (auth.isLoggedIn()) {
      thread.likeCount += isLiked ? -1 : 1
      setIsLiked(!isLiked)
      threadApi(auth).likeThread(thread.id).then(res => {
        if (res.isError) {
          // Revert the like count change on error
          thread.likeCount += isLiked ? 1 : -1
          setIsLiked(!isLiked)
        }
      })
    }
  }

  return (
    <Card 
      className="flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-border"
      onClick={goToThread}
    >
      <div className="flex flex-col items-center mx-6 py-2 rounded-md bg-muted min-w-[180px]">
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

      <div className="flex-1 px-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {thread.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {thread.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-start gap-2 flex-wrap flex-col">
                        <span className="text-xs text-muted-foreground">
              Posted {formatDate(thread.createdAt)} at {new Date(thread.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex flex-row gap-2 items-center">
            {thread.tags && thread.tags.slice(0, 3).map((tag, index) => (
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
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn()} onClick={e => likeThread(e)}>
                {isLiked ? <>
                  <Heart fill="currentColor" className="h-4 w-4 text-destructive"/>
                  <span className="text-sm text-destructive">{thread.likeCount}</span>
                </> : <>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{thread.likeCount}</span>
                </>}
              </button>
          </div>
        </div>
      </div>
    </Card>
  );
};