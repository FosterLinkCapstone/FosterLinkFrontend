import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { FaqModel } from "@/net-fosterlink/backend/models/FaqModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqCardProps {
    faq: FaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
}

export const FaqCard: React.FC<FaqCardProps> = ({ faq, onExpand, onCollapse, onShowDetail, expanded }) => {

  return (
    <Card 
      className="mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onExpand}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h3 className="text-xl font-semibold mb-2">{faq.title}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>By</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={faq.author.profilePictureUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {getInitials(faq.author.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{faq.author.username}</span>
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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
          >
            {
                expanded ? <ChevronDown className="h-6 w-6 text-gray-600" />  : <ChevronUp className="h-6 w-6 text-gray-600" />
            }
          </button>
        </div>
      </div>
      {expanded && <div className="bg-gray-100 p-6 text-center">
        <p className="text-gray-700">{faq.summary}</p>
        <div className="mt-4">
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={onShowDetail}
          >
            Click for more!
          </button>
        </div>
      </div>}
    </Card>
  );
};