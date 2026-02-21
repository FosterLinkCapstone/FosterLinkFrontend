import type { HiddenThreadModel } from "../HiddenThreadModel";

export interface GetHiddenThreadsResponse {
    threads: HiddenThreadModel[];
    totalPages: number;
}
