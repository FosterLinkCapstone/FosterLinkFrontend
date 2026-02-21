import { Card } from "@/components/ui/card";
import type { ReplyModel } from "../../backend/models/ReplyModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../backend/AuthContext";
import { useState } from "react";
import { threadApi } from "../../backend/api/ThreadApi";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { confirm } from "../ConfirmDialog";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { useNavigate } from "react-router";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { VerifiedCheck } from "../VerifiedCheck";

interface HiddenReplyCardProps {
  reply: ReplyModel;
  onReplyDelete?: (replyId: number) => void;
  onReplyRestore?: (replyId: number) => void;
}

export const HiddenReplyCard: React.FC<HiddenReplyCardProps> = ({ reply, onReplyDelete, onReplyRestore }) => {
  const auth = useAuth()
  const threadApiRef = threadApi(auth)
  const [loading, setLoading] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<boolean>(false)
  const navigate = useNavigate()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hiddenByLabel = reply.postMetadata?.userDeleted
    ? 'Deleted by its author'
    : reply.postMetadata?.hiddenBy
      ? `Hidden by ${reply.postMetadata.hiddenBy}`
      : 'Hidden by an administrator'

  const restoreReply = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to restore this reply? It will become visible to all users.',
    })
    if (confirmed) {
      setLoading(true)
      threadApiRef.hideReply(reply.id, false).then(result => {
        setLoading(false)
        if (!result.isError && onReplyRestore) {
          onReplyRestore(reply.id)
        }
      })
    }
  }

  const permanentlyDeleteReply = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to permanently delete this reply? This action cannot be undone.',
    })
    if (confirmed) {
      setLoading(true)
      threadApiRef.deleteHiddenReply(reply.id).then(result => {
        setLoading(false)
        if (!result.isError && onReplyDelete) {
          onReplyDelete(reply.id)
        }
      })
    }
  }

  return (
    <Card className="mb-4 border-destructive/30 bg-destructive/5 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-destructive/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-destructive/70" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-destructive/70" />
        )}
        <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
        <span className="text-sm text-destructive font-medium">{hiddenByLabel}</span>
        <span className="text-muted-foreground mx-1">·</span>
        <span className="text-sm text-muted-foreground font-semibold">{reply.author.username}</span>
        <span className="text-muted-foreground mx-1">·</span>
        <span className="text-xs text-muted-foreground">{formatDate(new Date(reply.createdAt))}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-destructive/20">
          <div className="flex gap-4 pt-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => navigate(buildProfileUrl(reply.author))}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={reply.author.profilePictureUrl} alt={reply.author.username} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(reply.author.fullName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => navigate(buildProfileUrl(reply.author))}
                  className="font-semibold hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-full px-1"
                >
                  {reply.author.username}
                </button>
                {reply.author.verified && <VerifiedCheck className="h-4 w-4" />}
                <span className="text-sm text-muted-foreground">
                  Member since {new Date(reply.author.createdAt).getFullYear()}
                </span>
              </div>

              <p className="text-foreground mb-3 text-start whitespace-pre-wrap">{reply.content}</p>

              <div className="flex flex-row gap-2 flex-wrap items-center">
                <Button variant="outline" size="sm" onClick={restoreReply}>
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-200 text-red-400"
                  onClick={permanentlyDeleteReply}
                >
                  Permanently Delete
                </Button>
                <BackgroundLoadSpinner loading={loading} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
