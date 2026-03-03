import type { AgencyModel } from "./AgencyModel";
import type { UserModel } from "./UserModel";

export interface AgencyDeletionRequestModel {
    id: number,
    createdAt: Date,
    agency: AgencyModel,
    requestedBy: UserModel
}
