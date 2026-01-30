import type { ThreadModel } from "../ThreadModel";

export interface GetThreadsResponse {
    threads: ThreadModel[];
    totalPages: number;
}
