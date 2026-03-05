export interface BookFilters {
    page: number;
    limit: number;
    title?: string;
    author?: string;
    onlyAvailable?: boolean;
    imageUrl?: string;
}
