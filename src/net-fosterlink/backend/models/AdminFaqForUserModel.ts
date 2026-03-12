import type { FaqModel } from "./FaqModel";

export interface GetAdminFaqAnswersForUserResponse {
    items: AdminFaqForUserModel[];
    totalPages: number;
}

export interface AdminFaqForUserModel {
    faq: FaqModel;
    entityStatus: "PENDING" | "APPROVED" | "DENIED" | "HIDDEN";
    hidden: boolean;
    hiddenByAuthor: boolean;
}
