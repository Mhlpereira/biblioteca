export interface BookListResponse {
    id: string;
    title: string;
    author: string;
    totalCopies: number;
    availableCopies: number;
    hasAvailable: boolean;
}
