export interface PaginatedResponse<T> {
    items: T[];
    totalPages: number;
}
