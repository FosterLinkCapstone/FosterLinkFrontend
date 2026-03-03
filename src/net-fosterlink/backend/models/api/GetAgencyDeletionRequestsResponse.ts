import type { AgencyDeletionRequestModel } from "../AgencyDeletionRequestModel";

export interface GetAgencyDeletionRequestsResponse {
    requests: AgencyDeletionRequestModel[],
    totalPages: number
}
