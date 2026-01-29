import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export const DummyFaq = ({ref} : {ref: React.RefObject<HTMLDivElement | null>}) => {
  return (
    <Card ref={ref} className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-10 ml-4"></div>
          <div className="flex-1 text-center">
            <h3 className="text-xl font-semibold mb-2">What are the basic requirements to become a foster parent?</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>By</span>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  SM
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">sarahm</span>
            </div>
          </div>
          <button className="p-2 hover:bg-accent rounded-full transition-colors ml-4">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="bg-muted p-6 text-center">
        <p className="text-foreground">
          Basic requirements typically include being at least 21 years old, passing background checks, completing training courses, and having adequate living space. Requirements may vary by state and agency.
        </p>
        <div className="mt-4">
          <button className="text-sm text-primary hover:text-primary/90 font-medium">
            Click for more!
          </button>
        </div>
      </div>
    </Card>
  );
};