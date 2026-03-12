import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { useNavigate } from "react-router";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { VerifiedCheck } from "../badges/VerifiedCheck";
import type { UserModel } from "@/net-fosterlink/backend/models/UserModel";

interface BaseReplyContentProps {
    author: UserModel;
    content: ReactNode;
    footer?: ReactNode;
}

export const BaseReplyContent: React.FC<BaseReplyContentProps> = ({ author, content, footer }) => {
    const navigate = useNavigate();

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => navigate(buildProfileUrl(author))}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={author.profilePictureUrl} alt={author.username} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(author.fullName)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => navigate(buildProfileUrl(author))}
                        className="font-semibold hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-full px-1 min-w-0"
                    >
                        <span className="truncate">{author.username}</span>
                    </button>
                    {author.verified && <VerifiedCheck className="h-4 w-4" />}
                    <span className="text-sm text-muted-foreground">
                        Member since {new Date(author.createdAt).getFullYear()}
                    </span>
                </div>

                {content}

                {footer}
            </div>
        </div>
    );
};
