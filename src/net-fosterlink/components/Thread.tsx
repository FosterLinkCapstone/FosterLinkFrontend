import { Card, CardContent } from "@/components/ui/card"
import { type ThreadModel } from "../backend/models/ThreadModel"
import { Heart, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const Thread = ({ thread }: { thread: ThreadModel }) => {
    return (
    <Card className="flex flex-row items-stretch overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all max-w-[75%]">
      <div className="flex flex-col justify-between flex-1 p-4 border-r border-gray-200">
        <div>
          <h2 className="text-lg font-semibold mb-1 truncate">
            {thread.title} - <span className="text-gray-500 text-sm">{thread.createdAt.toString()}</span>
          </h2>
          <p className="text-sm text-gray-600 text-clip">
            {thread.content} {/* TODO inefficient */}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>TODO comment count</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{thread.likeCount}</span>
          </div>
        </div>
      </div>

      <CardContent className="w-48 flex flex-col items-center justify-center text-center p-4">
        <Avatar className="w-14 h-14 mb-2">
          <AvatarImage src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106" />
          <AvatarFallback>PFP</AvatarFallback>
        </Avatar>
        <p className="font-medium">{thread.postedByUsername}</p>
        <Badge className="my-1">TODO: badges</Badge>
        <p className="text-xs text-gray-500">TODO: post count</p>
        <p className="text-xs text-green-600 font-medium">TODO: verification</p>
      </CardContent>
    </Card>
    )

} 