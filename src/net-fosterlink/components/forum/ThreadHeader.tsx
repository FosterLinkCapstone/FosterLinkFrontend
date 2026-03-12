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
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ThreadHeaderProps {
    thread: ThreadModel;
    tagsUpdated: (editedTags: string[]) => void;
    editingTags: boolean;
    setEditingTags: (editing: boolean) => void;
    tagEditLoading: boolean;
    titleUpdated: (editedTitle: string) => void;
    editingTitle: boolean;
    setEditingTitle: (editing: boolean) => void;
    titleEditLoading: boolean;
}

export const ThreadHeader = ({ 
    thread, 
    tagsUpdated, 
    editingTags, 
    setEditingTags, 
    tagEditLoading,
    titleUpdated,
    editingTitle,
    setEditingTitle,
    titleEditLoading }: ThreadHeaderProps) => {
    const navigate = useNavigate();
    const auth = useAuth();

    const [titleTextInput, setTitleTextInput] = useState<string>(thread.title)

    const TITLE_MIN_LENGTH = 5;
    const TITLE_MAX_LENGTH = 200;
    const isTitleValid = titleTextInput.length >= TITLE_MIN_LENGTH && titleTextInput.length <= TITLE_MAX_LENGTH;
    const canSaveTitle = titleTextInput === thread.title || isTitleValid;

    return (
        <div className="mb-4">
            {
                editingTitle ? (
                    <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-2">
                            <Input
                                value={titleTextInput}
                                onChange={(e) => setTitleTextInput(e.target.value)}
                                className="text-2xl font-bold"
                                maxLength={TITLE_MAX_LENGTH}
                                aria-invalid={titleTextInput.length > 0 && !isTitleValid}
                            />
                            <Button variant="outline" className="self-stretch px-3 text-xs" onClick={() => {
                                setEditingTitle(false)
                                if (titleTextInput !== thread.title && isTitleValid) {
                                    titleUpdated(titleTextInput)
                                }
                            }} disabled={titleEditLoading || !canSaveTitle}>Done</Button>
                            <BackgroundLoadSpinner loading={titleEditLoading} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {titleTextInput.length}/{TITLE_MAX_LENGTH}
                            {titleTextInput.length > 0 && titleTextInput.length < TITLE_MIN_LENGTH && (
                                <span className="text-destructive ml-1">(min {TITLE_MIN_LENGTH} characters)</span>
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="mb-2 w-full overflow-hidden">
                        <div className="flex items-center justify-center gap-2 w-full min-w-0">
                            <h1 className="text-3xl font-bold break-all min-w-0 text-center">{thread.title}</h1>
                            <BackgroundLoadSpinner loading={titleEditLoading} />
                        </div>
                        {(thread.author.id === auth.getUserInfo()?.id && !auth.restricted) && (
                            <div className="flex justify-center">
                                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-muted-foreground" onClick={() => setEditingTitle(true)} disabled={titleEditLoading}>Edit title</Button>
                            </div>
                        )}
                    </div>
                )
                    
            }
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
