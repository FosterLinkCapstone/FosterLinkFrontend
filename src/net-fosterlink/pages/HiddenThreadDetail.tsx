import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShieldAlert } from "lucide-react";
import { ReplyCard } from "../components/forum/ReplyCard";
import { ThreadPreviewMicro } from "../components/forum/ThreadPreviewMicro";
import { useEffect, useState } from "react";
import type { ThreadModel } from "../backend/models/ThreadModel";
import type { HiddenThreadModel } from "../backend/models/HiddenThreadModel";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import type { ReplyModel } from "../backend/models/ReplyModel";
import { getInitials } from "../util/StringUtil";
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner";
import { confirm } from "../components/ConfirmDialog";
import { useNavigate } from "react-router";
import { VerifiedCheck } from "../components/VerifiedCheck";
import { buildProfileUrl } from "../util/UserUtil";

export const HiddenThreadDetailPage = ({thread}: {thread: HiddenThreadModel}) => {
  const [otherThreads, setOtherThreads] = useState<ThreadModel[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [replies, setReplies] = useState<ReplyModel[]>([])
  const [loadingReplies, setLoadingReplies] = useState<boolean>(true)
  const auth = useAuth()
  const threadApiRef = threadApi(auth)
  const navigate = useNavigate()

  useEffect(() => {
    setLoadingReplies(true)
    threadApiRef.getReplies(thread.id).then(res => {
        if (!res.isError && res.data) {
            setReplies(res.data)
        }
        setLoadingReplies(false)
    })
    threadApiRef.randForUser(thread.author.id).then(res => {
        if (!res.isError && res.data) {
            setOtherThreads(res.data)
        }
    })
  }, [thread.id])

  const restoreThread = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to restore this thread? It will become visible to all users.',
    })
    if (confirmed) {
      setLoading(true)
      const res = await threadApiRef.setThreadHidden(thread.id, false)
      setLoading(false)
      if (!res.isError) {
        navigate('/threads/hidden')
      }
    }
  }

  const permanentlyDeleteThread = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to permanently delete this thread? This action cannot be undone.',
    })
    if (confirmed) {
      setLoading(true)
      await threadApiRef.deleteHiddenThread(thread.id)
      setLoading(false)
      navigate('/threads/hidden')
    }
  }

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

  const handleReplyDelete = (replyId: number) => {
    setReplies(replies.filter(r => r.id !== replyId))
  };

  const handleReplyRestore = (replyId: number) => {
    setReplies(replies.map(r => r.id === replyId ? { ...r, postMetadata: undefined } : r))
  };

  const handleReplyHide = (replyId: number, hiddenBy: string) => {
    setReplies(replies.map(r => r.id === replyId
      ? { ...r, postMetadata: { id: r.postMetadata?.id ?? 0, hidden: true, userDeleted: false, locked: false, verified: false, hiddenBy } }
      : r
    ))
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-80 space-y-4">
          <Card className="p-4 border-border">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Hidden Thread</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {!thread.postMetadata.userDeleted 
                ? `This thread was hidden by ${thread.postMetadata.hiddenBy}.`
                : `This thread was hidden by its author.`}
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={restoreThread}>
                Restore
              </Button>
              <Button variant="destructive" className="flex-1" onClick={permanentlyDeleteThread}>
                Delete
              </Button>
            </div>
            <BackgroundLoadSpinner loading={loading} />
          </Card>

          <Card className="p-4 border-border">
            <h3 className="font-semibold mb-3">Other Threads From This User</h3>
            <div className="max-h-[400px] overflow-y-auto">
                {
                    otherThreads.map(t => 
                        <ThreadPreviewMicro key={t.id} thread={t}/>
                    )
                }
            </div>
          </Card>
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
            <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => navigate(buildProfileUrl(thread.author))}
                className="flex items-center gap-2 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-full px-1"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.author.profilePictureUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(thread.author.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold">{thread.author.username}</span>
              </button>
              {thread.author.verified && (
                <VerifiedCheck className="h-4 w-4" />
              )}
              <span>
                Posted {formatDate(thread.createdAt)} at {new Date(thread.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex flex-row">
              {thread.tags && thread.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-muted px-2 py-0.5 mr-2">{tag}</Badge>
              ))}
            </div>
          </div>

          <Card className="p-6 mb-6 border-border">
            <div className="max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{thread.content}</p>
            </div>
          </Card>

          <div className="flex items-center gap-1.5 mb-4">
            <Button variant="outline" onClick={restoreThread}>Restore</Button>
            <Button variant="outline" className="bg-red-200 text-red-400" onClick={permanentlyDeleteThread}>Delete</Button>
            <BackgroundLoadSpinner loading={loading} />
          </div>

          <div className="flex items-center gap-1.5 mb-6">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{thread.likeCount}</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Replies</h2>
            {
              loadingReplies ? (
                <BackgroundLoadSpinner className="self-center justify-self-center" loading={loadingReplies}/>
              ) : (
              replies.length === 0 ? 
                (<p className="text-muted-foreground">No replies on this thread.</p>)
              : 
                replies.map(r => 
                    <ReplyCard 
                      key={r.id}
                      reply={r} 
                      onReply={() => {}}
                      onReplyDelete={handleReplyDelete}
                      onReplyRestore={handleReplyRestore}
                      onReplyHide={handleReplyHide}
                    />
                )
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};
