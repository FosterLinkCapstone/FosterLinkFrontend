export interface ErrorWrapper<T> {
    isError: boolean,
    error: string | undefined,
    data: T | undefined
}