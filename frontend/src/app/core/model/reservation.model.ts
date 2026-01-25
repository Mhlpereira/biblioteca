export interface Reservation {
    id: string;
    clientName?: string; 
    bookTitle: string;
    bookImage?: string; 
    author?: string;   
    reservedAt: Date | string;
    dueDate: Date | string;
    returnedAt?: Date | string;
    status: string;
    fineAmount?: number; 
}