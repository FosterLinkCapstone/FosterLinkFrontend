import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../../backend/AuthContext";
import { useState } from "react";
import { threadApi } from "../../backend/api/ThreadApi";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { confirm } from "../ConfirmDialog";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { useNavigate } from "react-router";
import { VerifiedCheck } from "../VerifiedCheck";

interface ReplyCardProps {
  reply: ReplyModel;
  onReply: (username: string) => void;
  onReplyUpdate?: (updatedReply: ReplyModel) => void;
  onReplyDelete?: (replyId: number) => void;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onReply, onReplyUpdate, onReplyDelete }) => {
  const auth = useAuth()
  const threadApiRef = threadApi(auth)
  const [isLiked, setIsLiked] = useState<boolean>(reply.liked)
  const [editing, setEditing] = useState<boolean>(false)
  const [editedContent, setEditedContent] = useState<string>(reply.content)
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const likeReply = () => {
    if (auth.isLoggedIn()) {
      setIsLiked(!isLiked)
      reply.likeCount += isLiked ? -1 : 1
      threadApiRef.likeReply(reply.id).then(res => {
        if (res.isError) {
          // Revert the like count change on error
          setIsLiked(!isLiked)
          reply.likeCount += isLiked ? 1 : -1
        }
      })
    }
  }

  const submitEdit = () => {
    setLoading(true)
    threadApiRef.editReplyContent(reply.id, editedContent).then(res => {
      setLoading(false)
      if (!res.isError && res.data) {
        reply.content = editedContent
        setEditing(false)
        if (onReplyUpdate) {
          onReplyUpdate(res.data)
        }
      }
    })
  }

  const deleteReply = async () => {
    setLoading(true)
    const res = await confirm({
      message: 'Are you sure you want to delete this reply?',
    })
    if (res) {
      threadApiRef.deleteReply(reply.id).then(result => {
        setLoading(false)
        if (!result.isError && result.data && onReplyDelete) {
          onReplyDelete(reply.id)
        }
      })
    } else {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => navigate(`/users/${reply.author.id}`)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={reply.author.profilePictureUrl} alt={reply.author.username} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(reply.author.fullName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => navigate(`/users/${reply.author.id}`)}
              className="font-semibold hover:text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-full px-1"
            >
              {reply.author.username}
            </button>
            {reply.author.verified && (
              <VerifiedCheck className="h-4 w-4" />
            )}
            <span className="text-sm text-gray-500">
              Member since {new Date(reply.author.createdAt).getFullYear()}
            </span>
          </div>

          {
            editing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value)
                }}
                className="w-full min-h-[100px] mb-3"
              />
            ) : (
              <p className="text-gray-700 mb-3 text-start whitespace-pre-wrap">{reply.content}</p>
            )
          }

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
          <div className="flex flex-row gap-2">
              {
            auth.isLoggedIn() && (auth.admin || auth.getUserInfo()!.id === reply.author.id) &&
            <div className="mt-2 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-200 text-red-400" 
                onClick={deleteReply}
              >
                Delete
              </Button>
            </div>
          }
          {
            auth.isLoggedIn() && auth.getUserInfo()!.id === reply.author.id && (
              <div className="mt-2 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (editing) {
                      setEditedContent(reply.content)
                      setEditing(false)
                    } else {
                      setEditing(true)
                    }
                  }}
                >
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
                {
                  editing && <Button 
                    variant="outline" 
                    size="sm"
                    onClick={submitEdit}
                  >
                    Submit
                  </Button>
                }
              </div>
            )
          }
          <BackgroundLoadSpinner loading={loading} />
          </div>
        </div>
      </div>
    </Card>
  );
};