import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VerifiedCheck } from "../badges/VerifiedCheck";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import { formatRelativeDate } from "@/net-fosterlink/util/DateUtil";
import { useNavigate } from "react-router";
import type { ThreadModel } from "@/net-fosterlink/backend/models/ThreadModel";
import { TagInputField } from "./TagInputField";
import { Button } from "@/components/ui/button";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";

interface ThreadHeaderProps {
    thread: ThreadModel;
    tagsUpdated: (editedTags: string[]) => void;
    editingTags: boolean;
    setEditingTags: (editing: boolean) => void;
    tagEditLoading: boolean;
}

export const ThreadHeader = ({ thread, tagsUpdated, editingTags, setEditingTags, tagEditLoading }: ThreadHeaderProps) => {
    const navigate = useNavigate();
    const auth = useAuth();

    return (
        <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
            <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
                <button
                    type="button"
                    onClick={() => navigate(buildProfileUrl(thread.author))}
                    className="flex items-center gap-2 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring rounded-full px-1"
                >
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={thread.author.profilePictureUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(thread.author.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{thread.author.username}</span>
                </button>
                {thread.author.verified && <VerifiedCheck className="h-4 w-4" />}
                <span>
                    Posted {formatRelativeDate(thread.createdAt)} at {new Date(thread.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            {editingTags ? (
                <TagInputField
                    inputTags={thread.tags ?? []}
                    onTagsChange={(newTags) => tagsUpdated(newTags)}
                    loading={tagEditLoading}
                    className="max-w-xl mt-1"
                    actions={
                        <div className="flex items-center gap-1.5">
                            <BackgroundLoadSpinner loading={tagEditLoading} />
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => setEditingTags(false)} disabled={tagEditLoading}>Done</Button>
                        </div>
                    }
                />
            ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                    {thread.tags && thread.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {thread.author.id === auth.getUserInfo()?.id && (
                        <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-muted-foreground" onClick={() => setEditingTags(true)}>Edit tags</Button>
                    )}
                </div>
            )}

        </div>
    );
};
