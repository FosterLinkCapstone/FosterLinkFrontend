import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Heart } from "lucide-react";
import { ReplyCard } from "../components/forum/ReplyCard";
import { ThreadPreviewMicro } from "../components/forum/ThreadPreviewMicro";
import { useEffect, useState } from "react";
import type { ThreadModel } from "../backend/models/ThreadModel";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../backend/AuthContext";
import { threadApi } from "../backend/api/ThreadApi";
import type { ReplyModel } from "../backend/models/ReplyModel";
import { getInitials } from "../util/StringUtil";

export const ThreadDetailPage = ({thread}: {thread: ThreadModel}) => {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [otherThreads, setOtherThreads] = useState<ThreadModel[]>([])
  const [replies, setReplies] = useState<ReplyModel[]>([])
  const auth = useAuth()
  const [isLiked, setIsLiked] = useState<boolean>(thread.liked)
  const threadApiRef = threadApi(auth)

  useEffect(() => {
    threadApiRef.getReplies(thread.id).then(th => {
        setReplies(th)
    })
    threadApiRef.randForUser(thread.author.id).then(th => {
        setOtherThreads(th)
    })
  }, [thread.id])

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setReplyText(`@${username}, `);
  };

  const handleSubmitNewReply = () => {
    let success = false
    if (auth.isLoggedIn()) {
      if (replyText != '' && thread) {
        threadApiRef.replyTo(replyText, thread.id).then(res => {
          if (res) {
            success = true
            setReplies([res, ...replies])
          } else {
            // TODO output errors better
            const oldContent = replyText
            setReplyText("Internal server error... please try again later!")
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
    if (success) {
      setReplyText('');
      setReplyingTo(null);
    }
  };
  const likeThread = () => {
    if (auth.isLoggedIn()) {
      thread.likeCount += isLiked ? -1 : 1
      setIsLiked(!isLiked)
      threadApiRef.likeThread(thread.id)
    }
  }
  const handleCancelReply = () => {
    setReplyText('');
    setReplyingTo(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
        <Navbar userInfo={auth.getUserInfo()}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-80 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Reply</h3>
            <Textarea
              placeholder="Enter reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="mb-3 min-h-[120px]"
            />
            <Button onClick={handleSubmitNewReply} className="w-full">
              Submit
            </Button>
          </Card>

          <Card className="p-4">
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
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar className="h-6 w-6">
                <AvatarImage src={thread.author.profilePictureUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {getInitials(thread.author.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{thread.author.username}</span>
              {thread.author.verified && (
                <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
              )}
              <span>Posted at {thread.createdAt.toLocaleString()}</span>
            </div>
          </div>

          <Card className="p-6 mb-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{thread.content}</p>
            </div>
          </Card>
            <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1 rounded transition-colors disabled:fg-gray-400 disabled:!cursor-not-allowed disabled:opacity-75" disabled={!auth.isLoggedIn()} onClick={likeThread}>
                {isLiked ? <>
                  <Heart fill="#ff0000ff" className="h-4 w-4 text-red-600"/>
                  <span color="#ff0000ff" className="text-sm text-red-700">{thread.likeCount}</span>
                </> : <>
                  <Heart className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{thread.likeCount}</span>
                </>}
              </button>
          <div>
            <h2 className="text-xl font-semibold mb-4">Replies</h2>
            {
                replies.map(r => 
                    <ReplyCard reply={r} onReply={handleReply}/>
                )
            }

            {(replyingTo && auth.isLoggedIn()) && (
              <Card className="p-4 mb-4 border-2 border-blue-200">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={auth.getUserInfo()!.profilePictureUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(auth.getUserInfo()!.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{auth.getUserInfo()!.username}</span>
                      {auth.getUserInfo()!.verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                      )}
                      <span className="text-sm text-gray-500">
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