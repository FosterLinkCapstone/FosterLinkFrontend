import type { UserModel } from "./UserModel";

export interface PendingFaqModel {
    id: number,
    title: string,
    summary: string,
    createdAt: Date,
    updatedAt: Date,
    author: UserModel,
    approvalStatus: ApprovalStatus
}
export enum ApprovalStatus {
    APPROVED,
    DENIED,
    PENDING
}