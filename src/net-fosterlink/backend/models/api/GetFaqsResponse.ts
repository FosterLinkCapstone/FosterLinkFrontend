import type { FaqModel } from "../FaqModel";

export interface GetFaqsResponse {
    faqs: FaqModel[];
    totalPages: number;
}
