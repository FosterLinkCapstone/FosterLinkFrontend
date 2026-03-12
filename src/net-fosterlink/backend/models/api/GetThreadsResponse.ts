import type { ThreadModel } from "../ThreadModel";
import type { PaginatedResponse } from "./PaginatedResponse";

export type GetThreadsResponse = PaginatedResponse<ThreadModel>;
