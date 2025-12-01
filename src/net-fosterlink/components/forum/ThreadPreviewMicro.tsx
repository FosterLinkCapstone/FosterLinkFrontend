import { Card } from "@/components/ui/card";
import type { ThreadModel } from "../../backend/models/ThreadModel";
import { useNavigate } from "react-router";

export const ThreadPreviewMicro = ({ thread } : {thread: ThreadModel}) => {
  const navigate = useNavigate()
  return (
    <Card 
      className="p-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors drop-shadow-lg"
      onClick={() => navigate(`/threads/thread/${thread.id}`)}
    >
      <h4 className="font-semibold text-sm mb-1">{thread.title}</h4>
      <div className="text-xs text-gray-500">Posted at {new Date(thread.createdAt).toLocaleDateString()}</div>
      <div className="flex gap-3 text-xs text-gray-600 mt-1">
        <span>Like count: {thread.likeCount}</span>
        <span>Comment count: {0 /* TODO */}</span>
      </div>
    </Card>
  );
};
