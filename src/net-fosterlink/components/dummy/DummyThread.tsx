import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Heart, MessageCircle } from "lucide-react";

export const DummyThread = () => {
  return (
    <Card className="flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
      <div className="flex flex-col items-center p-6 border-r border-gray-200 bg-gray-50/50 min-w-[180px]">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
            JD
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold text-sm">johndoe</span>
          <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          John Doe
        </div>
        
        <div className="text-xs text-gray-400">
          42 posts
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          Tips for first-time foster parents
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          I've been fostering for 5 years now and wanted to share some advice for those just starting out. The most important thing is to be patient with yourself and the children...
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">
              Posted on Nov 28, 2024 at 2:30 PM
            </span>
            <Badge variant="secondary" className="text-xs bg-gray-200 px-2 py-0.5">
              Advice
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 bg-gray-200 py-0.5">
              Beginners
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-colors">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">12</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-full transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">28</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};