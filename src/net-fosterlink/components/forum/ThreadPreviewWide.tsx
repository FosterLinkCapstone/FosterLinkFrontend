import { Card } from "@/components/ui/card";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { getInitials } from "@/net-fosterlink/util/StringUtil";

interface ThreadPreviewProps {
    thread: ThreadModel
}

export const ThreadPreviewWide: React.FC<ThreadPreviewProps> = ({ thread }) => {
  const formatDate = (jsonDate: Date) => {
    const date = new Date(jsonDate)
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const navigate = useNavigate()

  return (
    <Card 
      className="flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      onClick={() => navigate(`/threads/thread/${thread.id}`)}
    >
      <div className="flex flex-col items-center p-6 border-r border-gray-200 bg-gray-50/50 min-w-[180px]">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={thread.author.profilePictureUrl} alt={thread.author.username} />
          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
            {getInitials(thread.author.fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold text-sm">{thread.author.username}</span>
          {thread.author.verified && (
            <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
          )}
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          {thread.author.fullName}
        </div>
        
        <div className="text-xs text-gray-400">
          {thread.likeCount} posts
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          {thread.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {thread.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">
              Posted on {formatDate(thread.createdAt)} at {new Date(thread.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {thread.tags && thread.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-colors">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">
                {0} {/* TODO */}
              </span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">
                {thread.likeCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};