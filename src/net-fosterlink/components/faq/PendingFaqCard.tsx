import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ApprovalStatus, type PendingFaqModel } from "@/net-fosterlink/backend/models/PendingFaqModel";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { AlertCircleIcon, ChevronDown, ChevronUp } from "lucide-react";

interface PendingFaqCardProps {
    faq: PendingFaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    onApprove: (faq: PendingFaqModel) => void;
    onDeny: (faq: PendingFaqModel) => void;
}

export const PendingFaqCard: React.FC<PendingFaqCardProps> = ({ faq, onExpand, onCollapse, onShowDetail, expanded, onApprove, onDeny }) => {

    return (
        <div className="flex flex-col w-full gap-1">
            {faq.approvalStatus == ApprovalStatus.DENIED && (
                <Alert className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70" variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Denied by {faq.deniedByUsername}</AlertTitle>
                </Alert>
            )}
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
                        {
                            expanded ? <ChevronUp className="h-6 w-6 text-muted-foreground" /> : <ChevronDown className="h-6 w-6 text-muted-foreground" />
                        }
                    </button>
                </div>
            </div>
            {expanded && <div className="bg-muted p-6 text-center">
                <p className="text-foreground mb-4">{faq.summary}</p>
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowDetail();
                        }}
                        className="text-sm text-primary hover:text-primary/90 font-medium"
                    >
                        Click for more!
                    </button>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onApprove(faq);
                            }}
                            className="text-sm text-green-700 hover:text-green-800 font-medium dark:text-green-300 dark:hover:text-green-200 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:hover:bg-emerald-500/30"
                            variant="outline"
                        >
                            Approve
                        </Button>
                        {
                            faq.approvalStatus !== ApprovalStatus.DENIED && 
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeny(faq);
                                }}
                                className="text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30"
                                variant="outline"
                            >
                                Deny
                            </Button>
                        }

                    </div>
                </div>
            </div>}
            </Card>
        </div>
    );
};