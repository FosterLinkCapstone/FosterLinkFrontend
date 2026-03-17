import type { FaqModel } from "../FaqModel";
import type { PaginatedResponse } from "./PaginatedResponse";

export type GetFaqsResponse = PaginatedResponse<FaqModel>;
