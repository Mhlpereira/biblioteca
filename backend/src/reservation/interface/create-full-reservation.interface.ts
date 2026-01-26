import { ReservationStatus } from '../enum/reservation-status.enum';

export interface CreateFullReservation {

    clientId: string;
    bookCopyId: string;
    reservedAt?: string;
    dueDate: string;
    status?: ReservationStatus;
    returnedAt?: string;
    daysLate?: number;
    fineAmount?: number;
}
