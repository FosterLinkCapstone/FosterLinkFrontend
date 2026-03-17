import type { UserModel } from "./UserModel";
import type { PaginatedResponse } from "./api/PaginatedResponse";

export interface AccountDeletionRequestModel {
    id: number
    requestedAt: Date
    autoApproveBy: Date
    reviewedAt: Date | null
    autoApproved: boolean
    approved: boolean
    delayNote: string | null
    clearAccount: boolean
    requestedBy: UserModel
    reviewedBy: UserModel | null
}

export type GetAccountDeletionRequestsResponse = PaginatedResponse<AccountDeletionRequestModel>;
