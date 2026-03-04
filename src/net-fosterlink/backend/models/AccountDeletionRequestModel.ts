import type { UserModel } from "./UserModel";

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

export interface GetAccountDeletionRequestsResponse {
    requests: AccountDeletionRequestModel[]
    totalPages: number
}
