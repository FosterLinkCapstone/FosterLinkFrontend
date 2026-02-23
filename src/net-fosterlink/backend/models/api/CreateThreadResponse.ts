import type { ThreadModel } from "../ThreadModel";
import type { FieldError } from "@/net-fosterlink/util/ValidationError";

export interface CreateThreadResponse {
    thread: ThreadModel | undefined,
    error: string | undefined,
    validationErrors?: FieldError[]
}