import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";
import { VerifiedCheck } from "../VerifiedCheck";

export const DummyThread = ({ref} : {ref: React.RefObject<HTMLDivElement | null>}) => {
  return (
    <Card ref={ref} className="flex overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-border">
      <div className="flex flex-col items-center p-6 border-r border-border bg-muted/50 min-w-[180px]">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            JD
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center gap-1 mb-1">
          <span className="font-semibold text-sm">johndoe</span>
          <VerifiedCheck className="h-4 w-4" />
        </div>
        
        <div className="text-xs text-muted-foreground mb-3">
          John Doe
        </div>
        
        <div className="text-xs text-muted-foreground/80">
          42 posts
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Tips for first-time foster parents
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          I've been fostering for 5 years now and wanted to share some advice for those just starting out. The most important thing is to be patient with yourself and the children...
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              Posted on Nov 28, 2024 at 2:30 PM
            </span>
            <Badge variant="secondary" className="text-xs bg-muted px-2 py-0.5">
              Advice
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 bg-muted py-0.5">
              Beginners
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1.5 rounded-full transition-colors">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">12</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1.5 rounded-full transition-colors">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">28</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};