import type { AgencyModel } from "./AgencyModel";

export interface AdminAgencyForUserModel {
    entity: AgencyModel;
    entityStatus: "PENDING" | "APPROVED" | "DENIED" | "HIDDEN";
    hidden: boolean;
}
