import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import type { UserModel } from "@/net-fosterlink/backend/models/UserModel";

interface BaseFaqData {
    title: string;
    summary: string;
    author: UserModel;
}

interface BaseFaqCardProps {
    faq: BaseFaqData;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    contentLoading?: boolean;
    statusBanner?: ReactNode;
    actionButtons?: ReactNode;
}

export const BaseFaqCard: React.FC<BaseFaqCardProps> = ({
    faq,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    contentLoading,
    statusBanner,
    actionButtons,
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-full gap-1">
            {statusBanner}
            <Card
                className="mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border"
                onClick={onExpand}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="w-10 ml-4"></div>
                        <div className="flex-1 text-center">
                            <h3 className="text-xl font-semibold mb-2">{faq.title}</h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(buildProfileUrl(faq.author));
                                    }}
                                    className="flex flex-row gap-2 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <span>By</span>
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={faq.author.profilePictureUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {getInitials(faq.author.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{faq.author.username}</span>
                                </button>
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
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShowDetail();
                                    }}
                                    className="text-sm text-primary hover:text-primary/90 font-medium"
                                    disabled={contentLoading}
                                >
                                    Click for more!
                                </button>
                                {contentLoading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" aria-hidden />
                                )}
                            </div>
                        </div>
                        {actionButtons && (
                            <div className="py-0.5 px-2 border-t border-border bg-background flex w-full gap-2">
                                {actionButtons}
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};
