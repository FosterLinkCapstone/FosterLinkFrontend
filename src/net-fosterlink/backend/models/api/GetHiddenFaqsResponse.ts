import type { HiddenFaqModel } from "../HiddenFaqModel";

export interface GetHiddenFaqsResponse {
    faqs: HiddenFaqModel[];
    totalPages: number;
}
