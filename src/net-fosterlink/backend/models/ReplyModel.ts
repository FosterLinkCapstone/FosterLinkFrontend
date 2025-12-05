import type { UserModel } from "./UserModel"

export interface ReplyModel {
    id: number,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    author: UserModel,
    likeCount: number,
    liked: boolean,
}