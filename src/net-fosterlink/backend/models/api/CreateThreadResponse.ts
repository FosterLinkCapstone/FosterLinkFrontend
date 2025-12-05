import type { ThreadModel } from "../ThreadModel";

export interface CreateThreadResponse {
    thread: ThreadModel | undefined,
    error: string | undefined
}