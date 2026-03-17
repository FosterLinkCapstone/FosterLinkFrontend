import type { PostMetadataModel } from "./PostMetadataModel";
import type { UserModel } from "./UserModel";

export interface AdminReplyForUserModel {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    threadId: number;
    /** Title of the parent thread (for display). */
    threadTitle: string | null;
    /** Username of the parent thread author (for "Replying to @username" badge). */
    threadAuthorUsername: string | null;
    author: UserModel;
    postMetadata: PostMetadataModel;
}
