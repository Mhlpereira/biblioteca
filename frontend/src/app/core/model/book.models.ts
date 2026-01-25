export interface FindBooksQuery {
    title?: string;
    author?: string;
    onlyAvailable?: boolean;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    isAvailable: boolean;
}
