import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import type { HiddenFaqModel } from "@/net-fosterlink/backend/models/HiddenFaqModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { AlertCircleIcon, ChevronDown, ChevronUp } from "lucide-react";

interface HiddenFaqCardProps {
  faq: HiddenFaqModel;
  onExpand: () => void;
  onCollapse: () => void;
  onShowDetail: () => void;
  expanded: boolean;
  onRestore: (faq: HiddenFaqModel) => void;
  onDelete: (faq: HiddenFaqModel) => void;
}

export const HiddenFaqCard: React.FC<HiddenFaqCardProps> = ({
  faq,
  onExpand,
  onCollapse,
  onShowDetail,
  expanded,
  onRestore,
  onDelete,
}) => {
  return (
    <div className="flex flex-col w-full gap-1">
      <Alert
        className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70"
        variant="destructive"
      >
        <AlertCircleIcon />
        <AlertTitle>Hidden by {faq.hiddenBy}</AlertTitle>
      </Alert>

      <Card
        className="mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={onExpand}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="w-10 ml-4"></div>
            <div className="flex-1 text-center">
              <h3 className="text-xl font-semibold mb-2">{faq.title}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>By</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={faq.author.profilePictureUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(faq.author.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{faq.author.username}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (expanded) {
                  onCollapse();
                } else {
                  onExpand();
                }
              }}
              className="p-2 hover:bg-accent rounded-full transition-colors ml-4"
            >
              {expanded ? (
                <ChevronUp className="h-6 w-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <>
            <div className="bg-muted p-6 text-center">
              <p className="text-foreground mb-4">{faq.summary}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetail();
                }}
                className="text-sm text-primary hover:text-primary/90 font-medium"
              >
                Click for more!
              </button>
            </div>
            <div className="py-0.5 px-2 border-t border-border bg-background flex w-full gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(faq);
                }}
                className="flex-1 min-w-0 text-sm text-green-700 hover:text-green-800 font-medium dark:text-green-300 dark:hover:text-green-200 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:hover:bg-emerald-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                variant="outline"
              >
                Restore
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(faq);
                }}
                className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                variant="outline"
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
