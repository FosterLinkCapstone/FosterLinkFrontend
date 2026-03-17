import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle } from "lucide-react";
import { VerifiedCheck } from "../badges/VerifiedCheck";

export const DummyThread = ({ref} : {ref: React.RefObject<HTMLDivElement | null>}) => {
  return (
    <Card ref={ref} className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-border">
      <div className="flex flex-col items-center mx-6 py-2 rounded-md bg-muted min-w-0 sm:min-w-[180px]">
        <div className="mb-3 rounded-full">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              JD
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex items-center gap-1 mb-1 px-1">
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

      <div className="flex-1 px-4 sm:px-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Tips for first-time foster parents
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          I've been fostering for 5 years now and wanted to share some advice for those just starting out. The most important thing is to be patient with yourself and the children...
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-start gap-2 flex-wrap flex-col">
            <span className="text-xs text-muted-foreground">
              Posted on Nov 28, 2024 at 2:30 PM
            </span>
            <div className="flex flex-row gap-2 items-center">
              <Badge variant="secondary" className="text-xs bg-muted px-2 py-0.5">
                Advice
              </Badge>
              <Badge variant="secondary" className="text-xs bg-muted px-2 py-0.5">
                Beginners
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled>
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">12</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-accent px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:!cursor-not-allowed disabled:opacity-75" disabled>
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">28</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};