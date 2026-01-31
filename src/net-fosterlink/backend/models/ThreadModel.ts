import type { UserModel } from "./UserModel"

export interface ThreadModel {
    id: number,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    author: UserModel
    likeCount: number,
    liked: boolean,
    commentCount: number,
    userPostCount: number,
    tags: string[]
}