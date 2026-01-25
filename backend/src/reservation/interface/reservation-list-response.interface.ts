import { ReservationStatus } from "../enum/reservation-status.enum";

export interface ReservationListResponse {
    id: string;
    clientName: string;
    bookTitle: string;
    bookImage: string;
    reservedAt: Date;
    dueDate: Date;
    returnedAt?: Date;
    status: ReservationStatus;
    fineAmount?: number;
    isOverdue: boolean;
    potentialFine?: number;
}
