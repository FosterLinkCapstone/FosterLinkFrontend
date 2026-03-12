import type { AgencyModel } from "./AgencyModel";
import type { UserModel } from "./UserModel";

export interface AgencyDeletionRequestModel {
    id: number,
    createdAt: Date,
    autoApproveBy: Date,
    autoApproved: boolean,
    delayNote: string | null,
    agency: AgencyModel,
    requestedBy: UserModel,
    reviewedBy: UserModel | null
}
