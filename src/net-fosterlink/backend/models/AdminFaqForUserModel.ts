import type { FaqModel } from "./FaqModel";

export interface AdminFaqForUserModel {
    faq: FaqModel;
    entityStatus: "PENDING" | "APPROVED" | "DENIED" | "HIDDEN";
    hidden: boolean;
    hiddenByAuthor: boolean;
}
