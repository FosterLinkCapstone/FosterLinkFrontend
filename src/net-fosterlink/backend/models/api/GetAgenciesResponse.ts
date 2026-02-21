import type { AgencyModel } from "../AgencyModel";

export interface GetAgenciesResponse {
    agencies: AgencyModel[];
    totalPages: number;
}
