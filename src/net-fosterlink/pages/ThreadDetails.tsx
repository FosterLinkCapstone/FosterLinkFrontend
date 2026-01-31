import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReplyCard } from "../components/forum/ReplyCard";
import { ThreadPreviewMicro } from "../components/forum/ThreadPreviewMicro";
import { useEffect, useState } from "react";
import type { ThreadModel } from "../backend/models/ThreadModel";
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

export const ThreadDetailPage = ({thread}: {thread: ThreadModel}) => {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>(thread.content);
  const [otherThreads, setOtherThreads] = useState<ThreadModel[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [replies, setReplies] = useState<ReplyModel[]>([])
  const [loadingReplies, setLoadingReplies] = useState<boolean>(true)
  const auth = useAuth()
  const [isLiked, setIsLiked] = useState<boolean>(thread.liked)
  const threadApiRef = threadApi(auth)
  const navigate = useNavigate()

  useEffect(() => {
    setLoadingReplies(true)
    threadApiRef.getReplies(thread.id).then(res => {
        if (!res.isError && res.data) {
            setReplies(res.data)
            setLoadingReplies(false)
        }
    })
    threadApiRef.randForUser(thread.author.id).then(res => {
        if (!res.isError && res.data) {
            setOtherThreads(res.data)
        }
    })
  }, [thread.id])

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setReplyText(`@${username}, `);
  };

  const handleSubmitNewReply = () => {
    if (auth.isLoggedIn()) {
      if (replyText != '' && thread) {
        threadApiRef.replyTo(replyText, thread.id).then(res => {
          if (!res.isError && res.data) {
            setReplies([res.data, ...replies])
            setReplyText('');
            setReplyingTo(null);
          } else {
            const oldContent = replyText
            setReplyText(res.error || "Internal server error... please try again later!")
            setTimeout(() => setReplyText(oldContent), 3000)
          }
        })
      } else {
          const oldContent = replyText
          setReplyText("Please enter something!")
          setTimeout(() => setReplyText(oldContent), 3000)
      }
    } else {
      const oldContent = replyText
      setReplyText("Please log in")
      setTimeout(() => setReplyText(oldContent), 3000)
    }
  };
  const likeThread = () => {
    if (auth.isLoggedIn()) {
      thread.likeCount += isLiked ? -1 : 1
      setIsLiked(!isLiked)
      threadApiRef.likeThread(thread.id).then(res => {
        if (res.isError) {
          // Revert the like count change on error
          thread.likeCount += isLiked ? 1 : -1
          setIsLiked(!isLiked)
        }
      })
    }
  }
  const submitEdit = () => {
    thread.content = editedContent
    setEditing(false)
    setLoading(true)
    threadApiRef.editThreadContent(thread.id, editedContent).then(() => {
      setLoading(false)
    })
  }
  const deleteThread = async () => {
    setLoading(true)
    const res = await confirm({
      message: 'Are you sure you want to delete this thread?',
    })
    if (res) {
      threadApiRef.deleteThread(thread.id).then(() => {
        setLoading(false)
        window.location.href = `/threads`
      })
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
  const handleCancelReply = () => {
    setReplyText('');
    setReplyingTo(null);
  };

  const handleReplyUpdate = (updatedReply: ReplyModel) => {
    setReplies(replies.map(r => r.id === updatedReply.id ? updatedReply : r))
  };

  const handleReplyDelete = (replyId: number) => {
    setReplies(replies.filter(r => r.id !== replyId))
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-80 space-y-4">
          <Card className="p-4 border-border">
            <h3 className="font-semibold mb-3">Reply</h3>
            <Textarea
              placeholder="Enter reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="mb-3 min-h-[120px]"
              disabled={!auth.isLoggedIn()}
            />
            <Button onClick={handleSubmitNewReply} className="w-full" disabled={!auth.isLoggedIn()}>
              Submit
            </Button>
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
            <div className=" max-w-none">
              {
                editing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => {
                      setEditedContent(e.target.value)
                    }}
                    onSubmit={submitEdit}
                    className="w-full min-h-[200px]"
                    id="editedContent"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-foreground">{thread.content}</p>
                )
              }
            </div>
          </Card>
              {
                auth.isLoggedIn() && (
                  <div className="flex items-center gap-1.5">
                    {
                      (auth.admin || auth.getUserInfo()!.id === thread.author.id) &&
                      <Button variant="outline" className="mb-4 bg-red-200 text-red-400" onClick={deleteThread}>Delete</Button> 
                    }
                    {
                      auth.getUserInfo()!.id === thread.author.id && (
                        <>
                          <Button variant="outline" className="mb-4" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel' : 'Edit Thread'}
                          </Button>
                          {
                            editing && <Button variant="outline" className="mb-4" onClick={submitEdit}>Submit</Button>
                          }
                        </>

                      )
                    }
                    <BackgroundLoadSpinner loading={loading} />
                  </div> 

                )
              }

            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn()} onClick={likeThread}>
                {isLiked ? <>
                  <Heart fill="currentColor" className="h-4 w-4 text-destructive"/>
                  <span className="text-sm text-destructive">{thread.likeCount}</span>
                </> : <>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{thread.likeCount}</span>
                </>}
              </button>
          <div>
            <h2 className="text-xl font-semibold mb-4">Replies</h2>
            {
              loadingReplies ? (
                <BackgroundLoadSpinner className="self-center justify-self-center" loading={loadingReplies}/>
              ) : (
              replies.length === 0 ? 
                (<p className="text-muted-foreground">No replies yet. Be the first to reply!</p>)
              : 
                replies.map(r => 
                    <ReplyCard 
                      key={r.id}
                      reply={r} 
                      onReply={handleReply}
                      onReplyUpdate={handleReplyUpdate}
                      onReplyDelete={handleReplyDelete}
                    />
                )
              )
            }

            {(replyingTo && auth.isLoggedIn()) && (
              <Card className="p-4 mb-4 border-2 border-primary/30">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={auth.getUserInfo()!.profilePictureUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(auth.getUserInfo()!.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{auth.getUserInfo()!.username}</span>
                      {auth.getUserInfo()!.verified && (
                        <VerifiedCheck className="h-4 w-4" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        Member since {new Date(auth.getUserInfo()!.createdAt).getFullYear()}
                      </span>
                    </div>

                    <Textarea
                      placeholder="Enter text here"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="mb-3 min-h-[100px]"
                    />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelReply}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitNewReply}>
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};