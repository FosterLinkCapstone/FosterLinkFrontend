import type { UserModel } from "./UserModel";

export interface PendingFaqModel {
    id: number,
    title: string,
    summary: string,
    createdAt: Date,
    updatedAt: Date,
    author: UserModel,
    approvalStatus: ApprovalStatus,
    deniedByUsername: string | null
}
export enum ApprovalStatus {
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    PENDING = "PENDING"
}