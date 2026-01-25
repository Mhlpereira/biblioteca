export interface FindBooksQuery {
    title?: string;
    author?: string;
    onlyAvailable?: boolean;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    totalCopies: number;
    availableCopies: number;
    hasAvailable: boolean;
    imageUrl: string;
}
