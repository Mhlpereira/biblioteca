
export type ReservationStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELED';

export interface Reservation {
    id: string;
    clientName: string;
    bookTitle: string;
    bookImage: string | null;
    bookImageUrl?: string | null;
    author: string;
    reservedAt: string;
    dueDate: string;
    returnedAt: string | null;
    status: ReservationStatus;
    isReturned?: boolean;
    fineAmount: number | null;
    isOverdue: boolean;
    potentialFine?: number;

}

export interface CreateReservation {
    bookId: string;
    dueDate?: string;
}


export interface ReservationFilters {
    page?: number;
    limit?: number;
    overdueOnly?: boolean;
    status?: ReservationStatus;
    clientId?: string;
    bookId?: string;
}
