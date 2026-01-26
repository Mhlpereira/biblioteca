
export interface Reservation {
    id: string;
    clientName: string;
    bookTitle: string;
    bookImage: string | null;
    author: string;
    reservedAt: string;
    dueDate: string;
    returnedAt: string | null;
    status: 'ACTIVE' | 'RETURNED';
    fineAmount: number | null;
    isOverdue: boolean;
    potentialFine?: number;

}

export interface CreateReservation {
    clientId: string;
    bookId: string;
    dueDate?: string;
}


export interface ReservationFilters {
    page?: number;
    limit?: number;
    overdueOnly?: boolean;
    status?: 'ACTIVE' | 'RETURNED';
    clientId?: string;
    bookId?: string;
}
