import type { ThreadModel } from "../ThreadModel";

export interface ThreadSearchResponse {
    response: ThreadModel[],
    errorMessage: string | undefined
}