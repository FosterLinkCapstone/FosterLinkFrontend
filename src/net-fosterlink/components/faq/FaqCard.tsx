import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { FaqModel } from "@/net-fosterlink/backend/models/FaqModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";

interface FaqCardProps {
    faq: FaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    canEdit: boolean;
    onRemove: (id: number) => void;
}

export const FaqCard: React.FC<FaqCardProps> = ({ faq, onExpand, onCollapse, onShowDetail, expanded, canEdit, onRemove }) => {
  const auth = useAuth()
  const navigate = useNavigate()

  return (
    <Card 
      className="mb-4 overflow-hidden border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onExpand}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-10 ml-4"></div>
          <div className="flex-1 text-center">
            <h3 className="text-xl font-semibold mb-2">{faq.title}</h3>
            <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <button onClick={() => navigate(buildProfileUrl(faq.author))} className="flex flex-row gap-2 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring">
                <span>By</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={faq.author.profilePictureUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(faq.author.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{faq.author.username}</span>
              </button>
              {auth.admin && <span>Approved by {faq.approvedByUsername}</span>}
            </div>
          </div>
          <button 
            onClick={(e) => {
                if (expanded) {
                    e.stopPropagation();
                    onCollapse();
                } else {
                    onExpand()
                }

            }}
            className="p-2 hover:bg-accent rounded-full transition-colors ml-4"
          >
            {
                expanded ? <ChevronDown className="h-6 w-6 text-muted-foreground" />  : <ChevronUp className="h-6 w-6 text-muted-foreground" />
            }
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
          {canEdit && (
            <div className="py-0.5 px-2 border-t border-border bg-background flex w-full gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(faq.id);
                }}
                className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                variant="outline"
              >
                {auth.admin ? "Hide" : "Delete"}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};