import type { UserModel } from "./UserModel";

export interface FaqModel {
    id: number,
    title: string,
    summary: string,
    createdAt: Date,
    updatedAt: Date | undefined,
    author: UserModel,
    approvedByUsername: string
}