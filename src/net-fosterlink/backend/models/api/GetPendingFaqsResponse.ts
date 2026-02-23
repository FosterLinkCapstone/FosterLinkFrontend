import type { PendingFaqModel } from "../PendingFaqModel";

export interface GetPendingFaqsResponse {
    faqs: PendingFaqModel[];
    totalPages: number;
}
