import { PaginationDto } from "../../common/dto/pagination.dto";
import { ReservationStatus } from "../enum/reservation-status.enum";


export interface FindReservation extends PaginationDto{
        clientId?: string;
        bookId?: string;
        reservedAt?: string;
        dueDate?: string;
        returnedAt?: string;
        status?: ReservationStatus;
}