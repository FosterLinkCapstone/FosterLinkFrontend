import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../backend/AuthContext";
import { useState } from "react";
import { threadApi } from "../../backend/api/ThreadApi";
import { getInitials } from "@/net-fosterlink/util/StringUtil";

interface ReplyCardProps {
  reply: ReplyModel;
  onReply: (username: string) => void;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onReply }) => {
  const auth = useAuth()
  const threadApiRef = threadApi(auth)
  const [isLiked, setIsLiked] = useState<boolean>(reply.liked)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const likeReply = () => {
    if (auth.isLoggedIn()) {
      setIsLiked(!isLiked)
      reply.likeCount += isLiked ? -1 : 1
      threadApiRef.likeReply(reply.id)
    }
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={reply.author.profilePictureUrl} alt={reply.author.username} />
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {getInitials(reply.author.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">{reply.author.username}</span>
            {reply.author.verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
            )}
            <span className="text-sm text-gray-500">
              Member since {new Date(reply.author.createdAt).getFullYear()}
            </span>
          </div>

          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Posted at {formatDate(new Date(reply.createdAt))}
            </span>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1 rounded transition-colors disabled:fg-gray-400 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn()} onClick={likeReply}>
                {isLiked ? <>
                  <Heart fill="#ff0000ff" className="h-4 w-4 text-red-600"/>
                  <span color="#ff0000ff" className="text-sm text-red-700">{reply.likeCount}</span>
                </> : <>
                  <Heart className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{reply.likeCount}</span>
                </>}
              </button>
              { auth.isLoggedIn() && <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onReply(reply.author.username)}
              >
                Reply
              </Button> }

            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};