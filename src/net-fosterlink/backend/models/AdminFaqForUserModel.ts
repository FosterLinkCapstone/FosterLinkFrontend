import type { FaqModel } from "./FaqModel";

import type { PaginatedResponse } from "./api/PaginatedResponse";

export type GetAdminFaqAnswersForUserResponse = PaginatedResponse<AdminFaqForUserModel>;

export interface AdminFaqForUserModel {
    entity: FaqModel;
    entityStatus: "PENDING" | "APPROVED" | "DENIED" | "HIDDEN";
    hidden: boolean;
    hiddenByAuthor: boolean;
}
