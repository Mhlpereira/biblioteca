export interface FindBooksQuery {
    title?: string;
    author?: string;
    onlyAvailable?: boolean;
    page?: number;
    limit?: number;
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

export interface CreateBook{

    title: string;
    author: string;
    quantity: number;
    imageUrl: string;
}

export interface  AddCopy{
    bookId: string;
    quantity: number;
}

export interface RemoveCopy{
    bookId: string;
}

export interface BookCopy {
    id: string;
    status: BookCopyStatus;
    createdAt: string;      
    updatedAt: string;
    book?: Book;           
}

export enum BookCopyStatus {
    AVAILABLE = 'AVAILABLE',
    BORROWED = 'BORROWED',
    LOST = 'LOST',
    MAINTENANCE = 'MAINTENANCE'
}