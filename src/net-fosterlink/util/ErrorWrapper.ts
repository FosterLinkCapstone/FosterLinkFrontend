import type { FieldError } from "./ValidationError";

export interface ErrorWrapper<T> {
    isError: boolean,
    error: string | undefined,
    data: T | undefined,
    validationErrors?: FieldError[]
}