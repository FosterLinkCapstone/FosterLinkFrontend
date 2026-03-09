import type { AgencyModel } from "./AgencyModel";

export interface AdminAgencyForUserModel {
    agency: AgencyModel;
    entityStatus: "PENDING" | "APPROVED" | "DENIED" | "HIDDEN";
    hidden: boolean;
}
