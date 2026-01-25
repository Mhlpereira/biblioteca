export interface PaginationParams {
    page?: number;
    limit?: number;
    [key: string]: any;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
